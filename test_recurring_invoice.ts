import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend";

// Test data
const testInvoice = {
  id: 'test-invoice-1',
  is_recurring: true,
  recurrence_frequency: 'custom', // Changed to custom for 1-minute intervals
  recurrence_interval: 1,
  next_recurrence_date: new Date().toISOString(),
  recurrence_end_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // End after 24 hours
  status: 'draft',
  total: 1000,
  name: 'Test Customer',
  email: 'test@example.com', // Replace with your email
  invoice_number: 'INV-001',
  due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
};

async function testRecurringInvoice() {
  try {
    // Initialize Supabase client with your credentials
    const supabaseClient = createClient(
      'YOUR_SUPABASE_URL', // Replace with your Supabase URL
      'YOUR_SUPABASE_SERVICE_ROLE_KEY' // Replace with your service role key
    );

    // Initialize Resend with your API key
    const resend = new Resend('YOUR_RESEND_API_KEY'); // Replace with your Resend API key

    console.log('Starting test...');

    // 1. Create a test recurring invoice
    const { data: createdInvoice, error: createError } = await supabaseClient
      .from('invoices')
      .insert(testInvoice)
      .select()
      .single();

    if (createError) throw createError;
    console.log('Test invoice created:', createdInvoice);

    // 2. Get recurring invoices that need to be generated
    const { data: recurringInvoices, error: fetchError } = await supabaseClient
      .from('invoices')
      .select('*')
      .eq('is_recurring', true)
      .lte('next_recurrence_date', new Date().toISOString())
      .is('parent_invoice_id', null);

    if (fetchError) throw fetchError;
    console.log('Found recurring invoices:', recurringInvoices);

    // 3. Process each recurring invoice
    for (const invoice of recurringInvoices) {
      // Check end date
      if (invoice.recurrence_end_date && new Date(invoice.recurrence_end_date) < new Date()) {
        console.log('Recurrence ended for invoice:', invoice.id);
        continue;
      }

      // Calculate next date (1 minute from now)
      const nextDate = new Date(Date.now() + 60 * 1000);

      // Create new invoice
      const { data: newInvoice, error: newInvoiceError } = await supabaseClient
        .from('invoices')
        .insert({
          ...invoice,
          id: undefined,
          status: 'draft',
          issued_date: new Date().toISOString(),
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          parent_invoice_id: invoice.id,
          next_recurrence_date: nextDate.toISOString()
        })
        .select()
        .single();

      if (newInvoiceError) throw newInvoiceError;
      console.log('New invoice created:', newInvoice);

      // Update parent invoice
      const { error: updateError } = await supabaseClient
        .from('invoices')
        .update({
          next_recurrence_date: nextDate.toISOString()
        })
        .eq('id', invoice.id);

      if (updateError) throw updateError;
      console.log('Parent invoice updated with next recurrence date:', nextDate);

      // Send email
      if (newInvoice && newInvoice.email) {
        const emailResult = await resend.emails.send({
          from: "Your Company <your@email.com>",
          to: newInvoice.email,
          subject: `Your Invoice #${newInvoice.invoice_number || newInvoice.invoiceNumber}`,
          html: `
            <h2>Hi ${newInvoice.name || "there"},</h2>
            <p>Your new invoice is ready.</p>
            <p><b>Amount:</b> $${newInvoice.total}</p>
            <p><b>Due Date:</b> ${newInvoice.due_date || newInvoice.dueDate}</p>
            <p>Thank you for your business!</p>
          `
        });
        console.log('Email sent:', emailResult);
      }
    }

    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test every minute
setInterval(testRecurringInvoice, 60 * 1000);

// Run immediately on start
testRecurringInvoice(); 