export default function SettingsView() {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-zinc-200">
      <h2 className="text-xl font-semibold mb-4">Settings</h2>
      <h3 className="text-lg font-medium mb-2">Logs</h3>
      <div className="bg-zinc-900 text-zinc-100 p-4 rounded-md font-mono text-sm h-64 overflow-y-auto">
        <p>[2026-03-10 13:50:00] Plugin generated successfully.</p>
        <p>[2026-03-10 13:52:15] Route &apos;HubSpot Webhook&apos; updated.</p>
      </div>
    </div>
  );
}
