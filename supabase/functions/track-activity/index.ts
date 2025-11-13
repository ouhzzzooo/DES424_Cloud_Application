import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ActivityData {
  timestamp: string;
  duration_seconds: number;
  activity: string;
  confidence: number;
  user: string;
  device: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const activityData: ActivityData = await req.json();
    console.log('Received activity data:', activityData);

    // 1. Find or create activity type
    const { data: activityType, error: activityTypeError } = await supabaseClient
      .from('activity_types')
      .select('id')
      .ilike('name', activityData.activity)
      .single();

    if (activityTypeError && activityTypeError.code !== 'PGRST116') {
      throw activityTypeError;
    }

    let activityTypeId = activityType?.id;

    if (!activityTypeId) {
      const { data: newActivityType, error: createError } = await supabaseClient
        .from('activity_types')
        .insert({ name: activityData.activity.toLowerCase() })
        .select('id')
        .single();

      if (createError) throw createError;
      activityTypeId = newActivityType.id;
    }

    // 2. Insert activity event
    const { error: eventError } = await supabaseClient
      .from('user_activity_events')
      .insert({
        user_id: activityData.user,
        activity_type_id: activityTypeId,
        timestamp: activityData.timestamp,
      });

    if (eventError) throw eventError;

    // 3. Update daily aggregate
    const eventDate = new Date(activityData.timestamp).toISOString().split('T')[0];
    
    const { data: existingDaily } = await supabaseClient
      .from('user_activity_daily')
      .select('*')
      .eq('user_id', activityData.user)
      .eq('activity_type_id', activityTypeId)
      .eq('date', eventDate)
      .single();

    if (existingDaily) {
      // Update existing record
      const { error: updateError } = await supabaseClient
        .from('user_activity_daily')
        .update({
          total_seconds: existingDaily.total_seconds + activityData.duration_seconds,
          session_count: existingDaily.session_count + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingDaily.id);

      if (updateError) throw updateError;
    } else {
      // Create new record
      const { error: insertError } = await supabaseClient
        .from('user_activity_daily')
        .insert({
          user_id: activityData.user,
          activity_type_id: activityTypeId,
          date: eventDate,
          total_seconds: activityData.duration_seconds,
          session_count: 1,
        });

      if (insertError) throw insertError;
    }

    // 4. Update goal progress if applicable
    const { data: activeGoals } = await supabaseClient
      .from('user_goals')
      .select('*')
      .eq('user_id', activityData.user)
      .eq('activity_type_id', activityTypeId)
      .eq('is_active', true)
      .lte('start_date', eventDate)
      .or(`end_date.is.null,end_date.gte.${eventDate}`);

    if (activeGoals && activeGoals.length > 0) {
      for (const goal of activeGoals) {
        const achievedMinutes = Math.floor((existingDaily?.total_seconds || 0 + activityData.duration_seconds) / 60);
        const targetMet = achievedMinutes >= goal.target_minutes;

        const { data: existingProgress } = await supabaseClient
          .from('user_goal_progress')
          .select('*')
          .eq('goal_id', goal.id)
          .eq('date', eventDate)
          .single();

        if (existingProgress) {
          await supabaseClient
            .from('user_goal_progress')
            .update({
              achieved_minutes: achievedMinutes,
              target_met: targetMet,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingProgress.id);
        } else {
          await supabaseClient
            .from('user_goal_progress')
            .insert({
              goal_id: goal.id,
              date: eventDate,
              achieved_minutes: achievedMinutes,
              target_met: targetMet,
            });
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Activity tracked successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error tracking activity:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
