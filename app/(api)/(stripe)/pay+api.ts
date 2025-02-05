import { Stripe } from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { payment_method_id, payment_intent_id, customer_id } = body;

    if (!payment_method_id || !payment_intent_id || !customer_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    // Attach payment method to customer
    const paymentMethod = await stripe.paymentMethods.attach(
      payment_method_id,
      { customer: customer_id }
    );

    // Confirm the payment intent (Handles 3D Secure OTP flow)
    const result = await stripe.paymentIntents.confirm(payment_intent_id, {
      payment_method: paymentMethod.id,
      return_url: "https://yourapp.com/payment-success", // Redirect after OTP
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment successful",
        result: result,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing payment:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
