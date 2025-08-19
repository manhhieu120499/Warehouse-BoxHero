import React, { useMemo, useState } from "react";
import classNames from "classnames/bind";
import styles from "./Proposal.module.scss"; 
import { Button } from "../../components";
import {generateCode} from "../../utils/generate"

const cx = classNames.bind(styles);

const currency = (n) => (isNaN(n) ? "0" : new Intl.NumberFormat("vi-VN").format(Number(n)));
const todayISO = () => new Date().toISOString().slice(0, 10);
const emptyItem = () => ({ batchId: "", sku: "", name: "", uom: "", qty: 0, price: 0, note: "" });

export default function ProposalCreatePage() {
  const [code, setCode] = useState("");
  const [date, setDate] = useState(todayISO());
  const [creator, setCreator] = useState("");
  const [approver, setApprover] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [reason, setReason] = useState("");

  const [showSupplier, setShowSupplier] = useState(false);
  const [supplier, setSupplier] = useState({ code: "", name: "", contact: "", phone: "", email: "" });

  const [items, setItems] = useState([emptyItem()]);

  const totals = useMemo(() => {
    const totalQty = items.reduce((s, i) => s + (Number(i.qty) || 0), 0);
    const totalValue = items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.price) || 0), 0);
    const unique = items.filter((i) => i.name?.trim()).length;
    return { totalQty, totalValue, unique };
  }, [items]);

  const addRow = () => setItems((prev) => [...prev, emptyItem()]);
  const removeRow = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));
  const updateCell = (idx, key, val) => setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [key]: val } : it)));

  const validate = () => {
    const errors = [];
    if (!creator.trim()) errors.push("Vui lòng nhập Người lập phiếu");
    if (!warehouse.trim()) errors.push("Vui lòng chọn Kho nhập");
    if (items.length === 0) errors.push("Danh sách hàng hóa đang trống");
    const hasQty = items.some((i) => Number(i.qty) > 0);
    if (!hasQty) errors.push("Ít nhất 1 dòng có Số lượng > 0");
    return errors;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (errs.length) {
      alert("Không thể lưu vì:\n- " + errs.join("\n- "));
      return;
    }
    const payload = {
      code,
      date,
      creator,
      approver,
      warehouse,
      reason,
      supplier: showSupplier ? supplier : null,
      items: items.filter((i) => i.name || i.sku),
      totals,
    };
    console.log("SUBMIT PDX:", payload); // Thực tế: gọi API backend
    alert("Đã lưu phiếu đề xuất (xem console để xem payload)");
  };

  const handleReset = () => {
    setCode(`PDX-${Date.now().toString().slice(-6)}`);
    setDate(todayISO());
    setCreator("");
    setApprover("");
    setWarehouse("");
    setReason("");
    setShowSupplier(false);
    setSupplier({ code: "", name: "", contact: "", phone: "", email: "" });
    setItems([emptyItem()]);
  };

  return (
    <div className={cx("page")}>
      {/* Header */}
      <header className={cx("header")}> 
        <div className={cx("headerLeft")}>
          <h1 className={cx("title")}>Phiếu đề xuất nhập kho</h1>
        </div>
        <div className={cx("headerActions")}>
          <Button outline borderRadiusMedium onClick={handleReset}><span>Làm mới</span></Button>
          <Button success borderRadiusMedium onClick={handleSubmit}>Lưu phiếu</Button>
        </div>
      </header>

      <main className={cx("container")}> 
        {/* Thông tin chung */}
        <section className={cx("card")}> 
          <h2 className={cx("cardTitle")}>Thông tin chung</h2>
          <div className={cx("grid3")}> 
            <div className={cx("field")}>
              <label>Mã phiếu</label>
              <div className={cx('field-control')}>
                <input placeholder="Tạo mã phiếu" readOnly={true} value={code} onChange={(e) => setCode(e.target.value)} />
                <Button primary borderRadiusMedium onClick={() => setCode(generateCode('PDX-'))}>
                    <span>Tạo mã phiếu</span>
                </Button>
              </div>
              
            </div>
            <div className={cx("field")}>
              <label>Ngày lập</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className={cx("field")}>
              <label>Kho nhập</label>
              <select value={warehouse} onChange={(e) => setWarehouse(e.target.value)}>
                <option value="">— Chọn kho —</option>
                <option value="KHO-HN">Kho Hà Nội</option>
                <option value="KHO-HCM">Kho TP.HCM</option>
                <option value="KHO-DN">Kho Đà Nẵng</option>
              </select>
            </div>
            <div className={cx("field")}>
              <label>Người lập phiếu</label>
              <input placeholder="Nguyễn Văn A" value={creator} onChange={(e) => setCreator(e.target.value)} />
            </div>
            <div className={cx("field")}>
              <label>Người duyệt</label>
              <select value={approver} onChange={(e) => setApprover(e.target.value)}>
                <option value="">— Chọn người duyệt —</option>
                <option value="Admin">Admin</option>
                <option value="Kế toán">Kế toán</option>
                <option value="Quản lý kho">Quản lý kho</option>
              </select>
            </div>
            <div className={cx("field", "colSpan3")}>
              <label>Lý do nhập</label>
              <textarea rows={3} placeholder="Nhập bổ sung, trả hàng NCC, nhập khuyến mãi..." value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
          </div>
        </section>

        {/* Nhà cung cấp */}
        <section className={cx("card")}> 
          <div className={cx("cardHeader")}> 
            <h2 className={cx("cardTitle")}>
              Nhà cung cấp <span className={cx("muted")}>(tùy chọn)</span>
            </h2>
            <label className={cx("checkbox")}>
              <input type="checkbox" checked={showSupplier} onChange={(e) => setShowSupplier(e.target.checked)} />
              <span>Thêm thông tin nhà cung cấp</span>
            </label>
          </div>
          {showSupplier && (
            <div className={cx("grid3")}> 
              <div className={cx("field")}>
                <label>Mã NCC</label>
                <input value={supplier.code} onChange={(e) => setSupplier({ ...supplier, code: e.target.value })} />
              </div>
              <div className={cx("field")}>
                <label>Tên NCC</label>
                <input value={supplier.name} onChange={(e) => setSupplier({ ...supplier, name: e.target.value })} />
              </div>
              <div className={cx("field")}>
                <label>Người liên hệ</label>
                <input value={supplier.contact} onChange={(e) => setSupplier({ ...supplier, contact: e.target.value })} />
              </div>
              <div className={cx("field")}>
                <label>SĐT</label>
                <input value={supplier.phone} onChange={(e) => setSupplier({ ...supplier, phone: e.target.value })} />
              </div>
              <div className={cx("field")}>
                <label>Email</label>
                <input type="email" value={supplier.email} onChange={(e) => setSupplier({ ...supplier, email: e.target.value })} />
              </div>
            </div>
          )}
        </section>

        {/* Danh sách hàng hóa */}
        <section className={cx("card")}> 
          <div className={cx("cardHeader")}> 
            <h2 className={cx("cardTitle")}>Danh sách hàng hóa đề xuất nhập</h2>
            <div className={cx("actions")}> 
              <Button primary small borderRadiusSmall>
                <span>Quét mã</span>
            </Button>
              <Button primary small borderRadiusSmall onClick={addRow}>
                <span>Thêm dòng</span>
            </Button>
              
            </div>
          </div>

          <div className={cx("tableWrap")}> 
            <table className={cx("table")}>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Mã lô</th>
                  <th>Mã SP</th>
                  <th>Tên SP</th>
                  <th>ĐVT</th>
                  <th className={cx("num")}>
                    Số lượng
                  </th>
                  <th className={cx("num")}>Đơn giá</th>
                  <th className={cx("num")}>Thành tiền</th>
                  <th>Ghi chú</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => {
                  const amount = (Number(it.qty) || 0) * (Number(it.price) || 0);
                  return (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                       <td>
                        <input value={it.batchId} onChange={(e) => updateCell(idx, "batchId", e.target.value)} placeholder="Mã lô" />
                      </td>
                      <td>
                        <input value={it.sku} onChange={(e) => updateCell(idx, "sku", e.target.value)} placeholder="Mã sản phẩm" />
                      </td>
                      <td>
                        <input value={it.name} onChange={(e) => updateCell(idx, "name", e.target.value)} placeholder="Tên sản phẩm" />
                      </td>
                      <td>
                        <input value={it.uom} onChange={(e) => updateCell(idx, "uom", e.target.value)} placeholder="Cái / Hộp / Thùng" />
                      </td>
                      <td className={cx("num")}>
                        <input type="number" min={0} value={it.qty} onChange={(e) => updateCell(idx, "qty", e.target.value)} />
                      </td>
                      <td className={cx("num")}>
                        <input type="number" min={0} value={it.price} onChange={(e) => updateCell(idx, "price", e.target.value)} />
                      </td>
                      <td className={cx("num", "amount")}>{currency(amount)}</td>
                      <td>
                        <input value={it.note} onChange={(e) => updateCell(idx, "note", e.target.value)} placeholder="Ghi chú" />
                      </td>
                      <td>
                        <button className={cx("iconBtn")} onClick={() => removeRow(idx)} title="Xóa dòng">✕</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Tổng hợp */}
          <div className={cx("summary")}> 
            <div>
              <span className={cx("muted")}>Số mặt hàng: </span>
              <b>{totals.unique}</b>
            </div>
            <div>
              <span className={cx("muted")}>Tổng số lượng: </span>
              <b>{currency(totals.totalQty)}</b>
            </div>
            <div>
              <span className={cx("muted")}>Tổng giá trị: </span>
              <b>{currency(totals.totalValue)}</b>
            </div>
          </div>
        </section>
      </main>

      <footer className={cx("footer")}>
        <p>© {new Date().getFullYear()} Kho Hàng • Phiếu đề xuất nhập kho</p>
      </footer>
    </div>
  );
}