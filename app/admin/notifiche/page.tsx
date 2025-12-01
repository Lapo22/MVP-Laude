export default function AdminNotifichePage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 md:text-3xl">Notifiche</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configura le notifiche email per la tua struttura
        </p>
      </div>
      <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-gray-500">
          La gestione delle notifiche email è disponibile nella sezione Segnalazioni.
        </p>
      </div>
    </div>
  );
}
