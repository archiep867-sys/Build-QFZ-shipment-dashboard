import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

type Shipment = Record<string, any>;
const api = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, options),
    body = await response.json().catch(() => ({}));
  if (!response.ok) throw Error(body.error || "Request failed");
  return body;
};
const fields = [
  ["qfz_ref", "QFZ Ref", "text"],
  ["packing_list", "Packing List", "text"],
  ["brand", "Brand", "text"],
  ["pl_received_date", "PL Received date", "date"],
  ["pl_received_time", "PL Received time", "time"],
  ["metrology_documents_received", "Metrology documents", "text"],
  ["attestation_date", "Attestation date", "date"],
  ["attestation_time", "Attestation time", "time"],
  ["bayan_received_date", "Bayan received date", "date"],
  ["bayan_received_time", "Bayan received time", "time"],
  ["payment_confirmation_date", "Payment confirmation date", "date"],
  ["payment_confirmation_time", "Payment confirmation time", "time"],
  ["metrology_approval_date", "Metrology approval date", "date"],
  ["metrology_approval_time", "Metrology approval time", "time"],
  ["dispatched_date", "Dispatched date", "date"],
  ["dispatched_time", "Dispatched time", "time"],
  ["remarks", "Remarks", "text"],
] as const;
const required = ["qfz_ref", "packing_list", "pl_received_date"];
const blank = () => Object.fromEntries(fields.map(([key]) => [key, ""]));
function ShipmentForm({
  shipment,
  close,
  saved,
}: {
  shipment: Shipment | null;
  close: () => void;
  saved: () => void;
}) {
  const [form, setForm] = useState<Shipment>(
      shipment
        ? Object.fromEntries(fields.map(([key]) => [key, shipment[key] || ""]))
        : blank(),
    ),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api(shipment ? `/api/shipments/${shipment.id}` : "/api/shipments", {
        method: shipment ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      saved();
      close();
    } catch (reason: any) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="overlay">
      <form className="shipmentform" onSubmit={submit}>
        <div className="modalhead">
          <div>
            <span className="eyebrow">Shipment record</span>
            <h2>{shipment ? "Edit shipment" : "Add shipment"}</h2>
          </div>
          <button
            type="button"
            className="iconbutton"
            onClick={close}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <p className="muted">
          Required fields are marked. Status is calculated from the dispatched
          date.
        </p>
        {error && <p className="formerror">{error}</p>}
        <div className="formgrid">
          {fields.map(([key, label, type]) => (
            <label key={key}>
              {label}
              {required.includes(key) && <b> *</b>}
              <input
                type={type}
                required={required.includes(key)}
                value={form[key]}
                onChange={(event) =>
                  setForm({ ...form, [key]: event.target.value })
                }
              />
            </label>
          ))}
        </div>
        <div className="formactions">
          <button type="button" onClick={close}>
            Cancel
          </button>
          <button className="primary" disabled={busy}>
            {busy ? "Saving…" : "Save shipment"}
          </button>
        </div>
      </form>
    </div>
  );
}
function ShipmentDetails({
  shipment,
  close,
}: {
  shipment: Shipment;
  close: () => void;
}) {
  const stages = [
    ["PL received", shipment.pl_received_date, shipment.pl_received_time],
    ["Attestation", shipment.attestation_date, shipment.attestation_time],
    [
      "Bayan received",
      shipment.bayan_received_date,
      shipment.bayan_received_time,
    ],
    [
      "Payment confirmed",
      shipment.payment_confirmation_date,
      shipment.payment_confirmation_time,
    ],
    [
      "Metrology approved",
      shipment.metrology_approval_date,
      shipment.metrology_approval_time,
    ],
    ["Dispatched", shipment.dispatched_date, shipment.dispatched_time],
  ].filter((stage) => stage[1]);
  return (
    <div className="overlay" onClick={close}>
      <aside
        className="detailpanel"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modalhead">
          <div>
            <span className="eyebrow">Shipment details</span>
            <h2>{shipment.qfz_ref}</h2>
          </div>
          <button className="iconbutton" onClick={close} aria-label="Close">
            ×
          </button>
        </div>
        <p className="muted">
          {shipment.brand || "No brand"} · {shipment.packing_list}
        </p>
        {shipment.is_delayed && (
          <section className="detailattention">
            <b>Needs attention · Delayed</b>
            <span>{shipment.delay_reason}</span>
          </section>
        )}
        <h3>Operational timeline</h3>
        <div className="timeline">
          {stages.map(([label, date, time]) => (
            <div className="stage" key={String(label)}>
              <b>{label}</b>
              <span>
                {date} {time}
              </span>
            </div>
          ))}
        </div>
        <div className="detailslist">
          {fields.map(([key, label]) => (
            <p className="detail" key={key}>
              <span>{label}</span>
              {shipment[key] || "—"}
            </p>
          ))}
        </div>
      </aside>
    </div>
  );
}
function App() {
  const [rows, setRows] = useState<Shipment[]>([]),
    [admin, setAdmin] = useState(false),
    [loginOpen, setLoginOpen] = useState(false),
    [form, setForm] = useState<Shipment | null | undefined>(),
    [selected, setSelected] = useState<Shipment | null>(null),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState("All"),
    [brand, setBrand] = useState("All Brands"),
    [sort, setSort] = useState("qfz_ref"),
    [message, setMessage] = useState(""),
    [file, setFile] = useState<File | null>(null),
    [importing, setImporting] = useState(false),
    [importResult, setImportResult] = useState<{
      imported: number;
      updated: number;
      skipped: number;
      errors: number;
      total: number;
      sheet: string;
    } | null>(null),
    [auth, setAuth] = useState({ username: "", password: "" });
  const load = () =>
    api("/api/shipments")
      .then(setRows)
      .catch((reason) => setMessage(reason.message));
  useEffect(() => {
    load();
    api("/api/admin/me")
      .then(() => setAdmin(true))
      .catch(() => {});
  }, []);
  const brands = useMemo(
    () =>
      Array.from(
        new Set(
          rows.map((row) => String(row.brand || "").trim()).filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [rows],
  );
  const normalStatus = (value: string) =>
    value === "Completed"
      ? "Dispatched"
      : value === "In Transit"
        ? "In Progress"
        : value;
  const matchesStatus = (row: Shipment) =>
    status === "All" ||
    (status === "Delayed"
      ? Boolean(row.is_delayed)
      : row.status === normalStatus(status));
  const data = useMemo(
    () =>
      rows
        .filter(
          (row) =>
            matchesStatus(row) &&
            (brand === "All Brands" ||
              String(row.brand || "").trim() === brand) &&
            [row.qfz_ref, row.packing_list, row.brand]
              .join(" ")
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
        .sort((a, b) =>
          String(a[sort] || "").localeCompare(String(b[sort] || "")),
        ),
    [rows, status, brand, query, sort],
  );
  const count = (value: string) =>
    value === "All"
      ? rows.length
      : value === "Delayed"
        ? rows.filter((row) => row.is_delayed).length
        : rows.filter((row) => row.status === normalStatus(value)).length;
  const attentionCount = rows.filter((row) => row.is_delayed).length;
  const signin = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await api("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(auth),
      });
      setAdmin(true);
      setLoginOpen(false);
      setMessage("Signed in as Admin.");
    } catch (reason: any) {
      setMessage(reason.message);
    }
  };
  const logout = async () => {
    try {
      await api("/api/admin/logout", { method: "POST" });
      setAdmin(false);
      setMessage("Signed out.");
    } catch (reason: any) {
      setMessage(reason.message);
    }
  };
  const remove = async (row: Shipment) => {
    if (confirm("Are you sure you want to delete this shipment?"))
      try {
        await api("/api/shipments/" + row.id, { method: "DELETE" });
        setMessage("Shipment deleted.");
        load();
      } catch (reason: any) {
        setMessage(reason.message);
      }
  };
  const upload = async () => {
    if (!file || importing) return;
    setImporting(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await api("/api/import", {
        method: "POST",
        body: formData,
      });
      setImportResult(result);
      setMessage("Excel import completed successfully.");
      setFile(null);
      load();
    } catch (reason: any) {
      setMessage("Excel import failed: " + reason.message);
    } finally {
      setImporting(false);
    }
  };
  const headers = [
      "QFZ Ref",
      "Packing List",
      "Brand",
      "PL Received",
      "Attestation",
      "Attestation duration",
      "Dispatched",
      "Dispatch duration",
      "Status",
      "Attention",
      "Remarks",
    ],
    sortKeys = [
      "qfz_ref",
      "packing_list",
      "brand",
      "pl_received_date",
      "attestation_date",
      "attestation_duration",
      "dispatched_date",
      "total_dispatch_duration",
      "status",
      "is_delayed",
      "remarks",
    ],
    cards = [
      ["All", "Total shipments"],
      ["Pending", "Pending"],
      ["In Transit", "In progress / In transit"],
      ["Completed", "Completed"],
      ["Delayed", "Delayed"],
    ];
  return (
    <>
      <header className="appheader">
        <div className="brandlockup">
          <div className="brandmark">Q</div>
          <div>
            <strong>Apparel QFZ DC Dispatch Shipment Tracker</strong>
            <small>Outbound operations</small>
          </div>
        </div>
        <div className="headerright">
          {admin ? (
            <>
              <span className="adminindicator">
                <i />
                Admin Dashboard
              </span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <button className="primary" onClick={() => setLoginOpen(true)}>
              Admin login
            </button>
          )}
        </div>
      </header>
      <div className={admin ? "shell adminshell" : "shell"}>
        {admin && (
          <aside className="adminnav">
            <span className="navlabel">Admin workspace</span>
            <button className="navitem active">
              <span>▦</span>Shipment management
            </button>
            <div className="navdivider" />
            <span className="navlabel">Access</span>
            <div className="navidentity">
              <span className="avatar">A</span>
              <div>
                <b>Administrator</b>
                <small>Authenticated session</small>
              </div>
            </div>
          </aside>
        )}
        <main className="workspace">
          <section className="pagehead">
            <div>
              <div className="breadcrumb">
                Operations <span>/</span> Outbound shipments
              </div>
              <h1>{admin ? "Shipment management" : "Outbound shipments"}</h1>
            </div>
            {admin && (
              <button
                className="primary addbutton"
                onClick={() => setForm(null)}
              >
                <span>+</span> Add shipment
              </button>
            )}
          </section>
          <section className="kpis">
            {cards.map(([value, label]) => (
              <button
                type="button"
                className={status === value ? "active" : ""}
                onClick={() => setStatus(value)}
                key={value}
              >
                <span>{label}</span>
                <b>{count(value)}</b>
              </button>
            ))}
          </section>
          <button
            type="button"
            className={
              status === "Delayed" ? "attentionpanel active" : "attentionpanel"
            }
            onClick={() => setStatus("Delayed")}
            aria-pressed={status === "Delayed"}
          >
            <span className="attentionicon">!</span>
            <span>
              <b>Needs Attention</b>
              <small>
                {attentionCount
                  ? attentionCount +
                    " active shipment" +
                    (attentionCount === 1 ? "" : "s") +
                    " exceed" +
                    (attentionCount === 1 ? "s" : "") +
                    " the expected dispatch timeline."
                  : "No active shipment currently exceeds the expected dispatch timeline."}
              </small>
            </span>
            <strong>
              {attentionCount}
              <em>View delayed</em>
            </strong>
          </button>
          <section className="toolbar">
            <div className="searchbox">
              <span>⌕</span>
              <input
                placeholder="Search QFZ ref, packing list, or brand"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="filtergroup">
              <span className="filterlabel">Status</span>
              <div className="segmented">
                {["All", "In Progress", "Dispatched"].map((value) => (
                  <button
                    className={status === value ? "active" : ""}
                    onClick={() => setStatus(value)}
                    key={value}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
            {admin && (
              <div className="adminactions importflow">
                <label className="filebutton">
                  Import Excel
                  <input
                    type="file"
                    accept=".xlsx"
                    onChange={(event) => {
                      setFile(event.target.files?.[0] || null);
                      setImportResult(null);
                    }}
                  />
                </label>
                {file ? (
                  <div className="fileready">
                    <b>{file.name}</b>
                    <small>Ready to upload</small>
                  </div>
                ) : (
                  <span className="importhint">Choose an .xlsx file</span>
                )}
                <button
                  className="primary importbutton"
                  disabled={!file || importing}
                  onClick={upload}
                >
                  {importing ? "Importing data…" : "Upload & Import Data"}
                </button>
                <a href="/api/export">Export</a>
              </div>
            )}
          </section>
          <section className="brandbar" aria-label="Filter shipments by brand">
            <span className="filterlabel">Brand</span>
            <div className="brandchips">
              <button
                className={brand === "All Brands" ? "active" : ""}
                onClick={() => setBrand("All Brands")}
              >
                All brands
              </button>
              {brands.map((value) => (
                <button
                  className={brand === value ? "active" : ""}
                  onClick={() => setBrand(value)}
                  key={value}
                >
                  {value}
                </button>
              ))}
            </div>
          </section>
          {importResult && (
            <section className="importresult">
              <div>
                <span className="eyebrow">Import complete</span>
                <b>{importResult.sheet} processed</b>
              </div>
              <div>
                <span>Records added</span>
                <b>{importResult.imported}</b>
              </div>
              <div>
                <span>Records updated</span>
                <b>{importResult.updated}</b>
              </div>
              <div>
                <span>Records skipped</span>
                <b>{importResult.skipped}</b>
              </div>
              <div className={importResult.errors ? "haserrors" : ""}>
                <span>Errors</span>
                <b>{importResult.errors}</b>
              </div>
              <button
                className="iconbutton"
                onClick={() => setImportResult(null)}
                aria-label="Dismiss import result"
              >
                ×
              </button>
            </section>
          )}
          {message && (
            <p className="message">
              <span>{message}</span>
              <button onClick={() => setMessage("")} aria-label="Dismiss">
                ×
              </button>
            </p>
          )}
          <section className="tablepanel">
            <div className="tablemeta">
              <span>
                <b>{data.length}</b> shipment{data.length === 1 ? "" : "s"}{" "}
                shown
              </span>
              <span className="muted">Click a column header to sort</span>
            </div>
            <div className="tablewrap">
              <table>
                <thead>
                  <tr>
                    {headers.map((label, index) => (
                      <th onClick={() => setSort(sortKeys[index])} key={label}>
                        {label}
                        <span
                          className={
                            sort === sortKeys[index] ? "sortactive" : "sort"
                          }
                        >
                          ↕
                        </span>
                      </th>
                    ))}
                    {admin && <th className="actionshead">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row) => (
                    <tr key={row.id}>
                      <td className="linkcell" onClick={() => setSelected(row)}>
                        {row.qfz_ref}
                      </td>
                      <td className="linkcell" onClick={() => setSelected(row)}>
                        {row.packing_list}
                      </td>
                      <td>{row.brand || "—"}</td>
                      <td className="datecell">
                        {row.pl_received_date}
                        <small>{row.pl_received_time}</small>
                      </td>
                      <td className="datecell">
                        {row.attestation_date || "—"}
                      </td>
                      <td>{row.attestation_duration || "—"}</td>
                      <td className="datecell">{row.dispatched_date || "—"}</td>
                      <td>{row.total_dispatch_duration || "—"}</td>
                      <td>
                        <span
                          className={
                            row.status === "Dispatched"
                              ? "status dispatched"
                              : "status"
                          }
                        >
                          {row.status}
                        </span>
                      </td>
                      <td>
                        {row.is_delayed ? (
                          <span
                            className="attentionbadge"
                            title={row.delay_reason}
                          >
                            Delayed
                          </span>
                        ) : (
                          <span className="attentionnone">—</span>
                        )}
                      </td>
                      <td className="remarks">{row.remarks || "—"}</td>
                      {admin && (
                        <td className="rowactions">
                          <button onClick={() => setForm(row)}>Edit</button>
                          <button
                            className="delete"
                            onClick={() => remove(row)}
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {!data.length && (
                <p className="empty">
                  No shipments match the selected summary card and filters.
                </p>
              )}
            </div>
          </section>
        </main>
      </div>
      {selected && (
        <ShipmentDetails shipment={selected} close={() => setSelected(null)} />
      )}{" "}
      {form !== undefined && (
        <ShipmentForm
          shipment={form || null}
          close={() => setForm(undefined)}
          saved={() => {
            setMessage("Shipment saved.");
            load();
          }}
        />
      )}
      {loginOpen && (
        <div className="overlay">
          <form className="login" onSubmit={signin}>
            <div className="modalhead">
              <div>
                <span className="eyebrow">Restricted access</span>
                <h2>Admin login</h2>
              </div>
              <button
                type="button"
                className="iconbutton"
                onClick={() => setLoginOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <p className="muted">Sign in to manage shipment records.</p>
            <label>
              Username
              <input
                required
                value={auth.username}
                onChange={(event) =>
                  setAuth({ ...auth, username: event.target.value })
                }
              />
            </label>
            <label>
              Password
              <input
                required
                type="password"
                value={auth.password}
                onChange={(event) =>
                  setAuth({ ...auth, password: event.target.value })
                }
              />
            </label>
            <button className="primary loginbutton">
              Sign in to dashboard
            </button>
          </form>
        </div>
      )}
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
