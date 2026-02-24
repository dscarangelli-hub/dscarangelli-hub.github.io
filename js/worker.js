// Initialize Stripe with your publishable key
const stripe = Stripe(pk_live_51StmiA03qJU1YgeOBQ9Bf6QT2BN4hu944B4ky40zHl66hdEyZerXgHjXZLeepOtVbCRr5sd6PGYJZ8ifgZdGhNRL00coeoP4Jg);

// Your Cloudflare Worker base URL
const WORKER_BASE = "https://wsua-2.dominicscar-law.workers.dev";

// -------------------------------
// One-time “coffee” donation
// -------------------------------
const donateOnceBtn = document.getElementById("donate-once");

if (donateOnceBtn) {
  donateOnceBtn.addEventListener("click", async () => {
    try {
      const res = await fetch(`${WORKER_BASE}/create-checkout`, {
        method: "POST"
      });

      if (!res.ok) {
        alert("Unable to start donation. Please try again.");
        return;
      }

      const data = await res.json();
      await stripe.redirectToCheckout({ sessionId: data.id });

    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    }
  });
}

// -------------------------------
// Tiered donations ($30, $60, $120)
// -------------------------------
async function startTier(amount) {
  try {
    const res = await fetch(`${WORKER_BASE}/create-checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount })
    });

    if (!res.ok) {
      alert("Unable to start donation. Please try again.");
      return;
    }

    const data = await res.json();
    await stripe.redirectToCheckout({ sessionId: data.id });

  } catch (err) {
    console.error(err);
    alert("Something went wrong. Please try again.");
  }
}
