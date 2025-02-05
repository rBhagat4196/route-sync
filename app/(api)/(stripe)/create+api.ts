import { Stripe } from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, amount } = body;

    if (!name || !email || !amount) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
      });
    }

    // Check if customer already exists
    let customer;
    const existingCustomers = await stripe.customers.list({ email });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({ name, email });
    }

    // Create an ephemeral key (required for mobile)
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2024-06-20" }
    );

    // Create a Payment Intent (for INR payments with UPI, Card, Net Banking)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseInt(amount) * 100, // Convert to paisa (₹1 = 100 paisa)
      currency: "inr", // Use INR for Indian payments
      customer: customer.id,
      payment_method_types: ["card", "upi", "netbanking"], // Enable supported methods
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return new Response(
      JSON.stringify({
        paymentIntent: paymentIntent.client_secret, // Send only the client secret
        ephemeralKey: ephemeralKey.secret,
        customer: customer.id,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
