// src/components/SecuritySim.tsx
import React, { useEffect, useState } from "react";

/**
 * SecuritySim
 *
 * Demo of SHA-256 hashing, signing and verification using Web Crypto.
 * - Progressive (simulated) hashing over "firmware" string (split into chunks)
 * - Key pair generation (ECDSA P-256) for demo signing
 * - Signature generation and verification
 *
 * Integrate this into a stage of your app. Exposes logs and visual progress.
 */

function bufToHex(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256(data: Uint8Array) {
  return await crypto.subtle.digest("SHA-256", data);
}

export default function SecuritySim({
  firmware = "DemoFirmwareImage-v1.0-ThisIsSampleData",
  onComplete,
}: {
  firmware?: string;
  onComplete?: (result: { verified: boolean; digestHex: string }) => void;
}) {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState<number>(0); // 0..100 for hashing
  const [stage, setStage] = useState<
    "idle" | "hashing" | "signing" | "verifying" | "done" | "failed"
  >("idle");
  const [digestHex, setDigestHex] = useState<string | null>(null);
  const [verified, setVerified] = useState<boolean | null>(null);

  // helper to push a log line
  const pushLog = (s: string) => setLogs((l) => [...l, `${new Date().toLocaleTimeString()} — ${s}`]);

  // run the entire simulation
  const runSimulation = async () => {
    // reset
    setLogs([]);
    setProgress(0);
    setDigestHex(null);
    setVerified(null);
    setStage("hashing");
    pushLog("Starting firmware hashing...");

    // convert firmware string to bytes
    const encoder = new TextEncoder();
    const fwBytes = encoder.encode(firmware);

    // simulate progressive hashing by chunking (purely visual; real digest computed via subtle.digest)
    const chunks = 8; // number of visual chunks
    const chunkSize = Math.ceil(fwBytes.length / chunks);
    let accumulated = new Uint8Array(0);

    for (let i = 0; i < chunks; i++) {
      // simulate slight delay for animation (and pretend to process chunk)
      await new Promise((r) => setTimeout(r, 220)); // tweak for animation speed
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, fwBytes.length);
      const slice = fwBytes.slice(start, end);

      // append to accumulated (visual only)
      const tmp = new Uint8Array(accumulated.length + slice.length);
      tmp.set(accumulated, 0);
      tmp.set(slice, accumulated.length);
      accumulated = tmp;

      const pct = Math.round(((i + 1) / chunks) * 100);
      setProgress(pct);
      pushLog(`Processed chunk ${i + 1}/${chunks} (${pct}%)`);
    }

    // compute _actual_ digest of entire firmware
    pushLog("Computing final SHA-256 digest (Web Crypto) ...");
    const digestBuf = await sha256(fwBytes);
    const hex = bufToHex(digestBuf);
    setDigestHex(hex);
    pushLog(`Digest (hex): ${hex}`);
    setStage("signing");

    // Generate ephemeral ECDSA key pair for demo (P-256)
    pushLog("Generating ephemeral ECDSA (P-256) key pair for demo signing...");
    const keyPair = await crypto.subtle.generateKey(
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      ["sign", "verify"]
    );

    pushLog("Signing digest with private key...");
    const signature = await crypto.subtle.sign(
      { name: "ECDSA", hash: { name: "SHA-256" } },
      keyPair.privateKey,
      digestBuf
    );
    pushLog(`Signature generated (${signature.byteLength} bytes)`);

    setStage("verifying");
    pushLog("Verifying signature with public key...");

    const ok = await crypto.subtle.verify(
      { name: "ECDSA", hash: { name: "SHA-256" } },
      keyPair.publicKey,
      signature,
      digestBuf
    );

    if (ok) {
      pushLog("Signature verification: SUCCESS");
      setVerified(true);
      setStage("done");
      setProgress(100);
      onComplete?.({ verified: true, digestHex: hex });
    } else {
      pushLog("Signature verification: FAILED");
      setVerified(false);
      setStage("failed");
      onComplete?.({ verified: false, digestHex: hex });
    }
  };

  // convenience: clear logs/status
  const reset = () => {
    setLogs([]);
    setProgress(0);
    setStage("idle");
    setDigestHex(null);
    setVerified(null);
  };

  return (
    <div className="w-full max-w-2xl p-4 bg-gray-900/60 rounded-md border border-gray-800">
      <h3 className="text-lg font-semibold mb-2">Real-time Security Simulation</h3>

      <div className="mb-3 text-sm text-gray-300">
        This demo computes a SHA-256 digest of a sample firmware image, signs it with an ephemeral
        key (ECDSA P-256), and verifies the signature using Web Crypto. The hashing progress is
        animated to show the step-by-step process.
      </div>

      <div className="mb-3">
        <div className="w-full bg-gray-800 h-3 rounded overflow-hidden">
          <div
            className="h-3 bg-gradient-to-r from-blue-500 to-cyan-400"
            style={{ width: `${progress}%`, transition: "width 200ms linear" }}
          />
        </div>
        <div className="mt-2 text-xs text-gray-400 flex justify-between">
          <span>Stage: <strong>{stage}</strong></span>
          <span>Progress: {progress}%</span>
        </div>
      </div>

      <div className="mb-3 flex space-x-2">
        <button
          className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500"
          onClick={runSimulation}
          disabled={stage === "hashing" || stage === "signing" || stage === "verifying"}
        >
          Start Simulation
        </button>

        <button
          className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600"
          onClick={reset}
        >
          Reset
        </button>
      </div>

      <div className="mb-3">
        <div className="text-xs text-gray-400 mb-1">Digest</div>
        <div className="text-sm text-gray-200 font-mono break-all p-2 bg-gray-800 rounded">
          {digestHex ?? "— not computed —"}
        </div>
      </div>

      <div className="mb-3">
        <div className="text-xs text-gray-400 mb-1">Verification Result</div>
        <div className="text-sm">
          {verified === null ? (
            <span className="text-gray-400">— waiting —</span>
          ) : verified ? (
            <span className="text-green-400">Verified ✅</span>
          ) : (
            <span className="text-red-400">Failed ❌</span>
          )}
        </div>
      </div>

      <div className="mb-2 text-xs text-gray-400">Logs</div>
      <div className="h-32 overflow-auto bg-black/40 p-2 rounded border border-gray-700 text-xs">
        {logs.map((l, i) => (
          <div key={i} className="text-gray-300">{l}</div>
        ))}
      </div>
    </div>
  );
}
