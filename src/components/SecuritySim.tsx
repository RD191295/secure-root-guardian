// src/components/SecuritySim.tsx
import React, { useEffect, useState } from "react";

/* Small reusable security-simulation panel that:
   - Animates chunked hashing (visual)
   - Generates ephemeral ECDSA keypair (demo)
   - Signs the digest and verifies it
   - Calls onComplete({ verified, digestHex })
*/

function bufToHex(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256(data: BufferSource) {
  return await crypto.subtle.digest("SHA-256", data);
}

export default function SecuritySim({
  firmware = "DemoFirmwareImage-v1.0-ThisIsSampleData",
  autoRun = false,
  onComplete,
}: {
  firmware?: string;
  autoRun?: boolean;
  onComplete?: (result: { verified: boolean; digestHex: string }) => void;
}) {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [stage, setStage] = useState<"idle" | "hashing" | "signing" | "verifying" | "done" | "failed">("idle");
  const [digestHex, setDigestHex] = useState<string | null>(null);
  const [verified, setVerified] = useState<boolean | null>(null);

  const pushLog = (s: string) => setLogs((l) => [...l, `${new Date().toLocaleTimeString()} — ${s}`]);

  const runSimulation = async () => {
    setLogs([]);
    setProgress(0);
    setDigestHex(null);
    setVerified(null);
    setStage("hashing");
    pushLog("Starting firmware hashing...");

    const encoder = new TextEncoder();
    const fwBytes = encoder.encode(firmware);

    // Visual chunking
    const chunks = 8;
    const chunkSize = Math.ceil(fwBytes.length / chunks);
    for (let i = 0; i < chunks; i++) {
      await new Promise((r) => setTimeout(r, 180)); // animation delay
      const pct = Math.round(((i + 1) / chunks) * 100);
      setProgress(pct);
      pushLog(`Processed chunk ${i + 1}/${chunks} (${pct}%)`);
    }

    pushLog("Computing final SHA-256 digest...");
    const digestBuf = await sha256(fwBytes);
    const hex = bufToHex(digestBuf);
    setDigestHex(hex);
    pushLog(`Digest (hex): ${hex}`);
    setStage("signing");

    // demo ephemeral ECDSA keypair
    pushLog("Generating ephemeral ECDSA key pair (P-256)...");
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
    pushLog(`Signature created (${signature.byteLength} bytes)`);

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

  useEffect(() => {
    if (autoRun) runSimulation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRun]);

  const reset = () => {
    setLogs([]);
    setProgress(0);
    setStage("idle");
    setDigestHex(null);
    setVerified(null);
  };

  return (
    <div className="w-full p-3 bg-gray-900/60 rounded-md border border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold">Security Simulation</div>
        <div className="text-xs text-gray-400">{stage}</div>
      </div>

      <div className="mb-2">
        <div className="w-full bg-gray-800 h-2 rounded overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        <button onClick={runSimulation} className="px-3 py-1 bg-blue-600 rounded">Start</button>
        <button onClick={reset} className="px-3 py-1 bg-gray-700 rounded">Reset</button>
      </div>

      <div className="text-xs text-gray-400 mb-2">Digest</div>
      <div className="font-mono text-xs bg-gray-800 p-2 rounded mb-3 break-words">{digestHex ?? "— not computed —"}</div>

      <div className="text-xs text-gray-400 mb-1">Verification</div>
      <div className="mb-3">
        {verified === null ? <span className="text-gray-400 text-sm">Waiting</span> :
          verified ? <span className="text-green-400 text-sm">Verified ✅</span> :
            <span className="text-red-400 text-sm">Failed ❌</span>}
      </div>

      <div className="text-xs text-gray-400 mb-1">Logs</div>
      <div className="h-28 overflow-auto bg-black/40 p-2 rounded border border-gray-700 text-xs">
        {logs.map((l, i) => <div key={i} className="text-gray-300">{l}</div>)}
      </div>
    </div>
  );
}
