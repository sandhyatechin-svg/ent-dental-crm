// Test database connection and table existence
// Run this in your browser console on the pharmacy page

const testDatabase = async () => {
  try {
    // Test if we can connect to Supabase
    const { createClient } = await import('https://cdn.skypack.dev/@supabase/supabase-js@2')
    
    const supabaseUrl = 'https://adygnadivhzoemoqrbgv.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkeWduYWRpdmh6b2Vtb3FyYmd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0Mzc0OTAsImV4cCI6MjA3MzAxMzQ5MH0.uY6Hx0UiMDSJFuIZ9ylz1mAHB7jL0N0Vew2rurUTnyE'
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    console.log('Testing database connection...')
    
    // Test 1: Check if patients table exists and has data
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('id, patient_id, name')
      .limit(5)
    
    if (patientsError) {
      console.error('❌ Patients table error:', patientsError)
    } else {
      console.log('✅ Patients table exists:', patients)
    }
    
    // Test 2: Check if prescriptions table exists
    const { data: prescriptions, error: prescriptionsError } = await supabase
      .from('prescriptions')
      .select('*')
      .limit(1)
    
    if (prescriptionsError) {
      console.error('❌ Prescriptions table error:', prescriptionsError)
    } else {
      console.log('✅ Prescriptions table exists:', prescriptions)
    }
    
    // Test 3: Try to insert a test record
    const testPatient = patients?.[0]
    if (testPatient) {
      const { data: insertData, error: insertError } = await supabase
        .from('prescriptions')
        .insert({
          patient_id: testPatient.id,
          medicine_name: 'Test Medicine',
          quantity: 1,
          price_per_unit: 10.00,
          total_amount: 10.00
        })
        .select()
      
      if (insertError) {
        console.error('❌ Insert test failed:', insertError)
      } else {
        console.log('✅ Insert test successful:', insertData)
        
        // Clean up test record
        await supabase
          .from('prescriptions')
          .delete()
          .eq('id', insertData[0].id)
        console.log('🧹 Test record cleaned up')
      }
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
  }
}

// Run the test
testDatabase()
