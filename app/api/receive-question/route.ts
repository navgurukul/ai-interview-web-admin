// app/api/receive-question/route.ts

let latestQuestion: any = null;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    latestQuestion = body;
    console.log("✅ Received question:", body);

    return new Response(JSON.stringify({ message: 'Stored' }), { status: 200 });
  } catch (e) {
    console.error("❌ POST error:", e);
    return new Response(JSON.stringify({ error: 'Failed to store' }), { status: 500 });
  }
}

export async function GET() {
  return new Response(JSON.stringify(latestQuestion || {}), { status: 200 });
}
