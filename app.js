let currentLang = 'th';
const i18n = {
    th: {
        sys_desc: "ระบบควบคุมคลังพัสดุแผนกแม่บ้าน", sign_in: "เข้าสู่ระบบ", login_sub: "กรอกรหัสพนักงานเพื่อเข้าใช้งานระบบ",
        emp_id: "รหัสพนักงาน", password: "รหัสผ่าน", btn_login: "เข้าสู่ระบบ", sys_title: "จัดการคลังพัสดุ",
        menu_inventory: "รายการพัสดุคงคลัง", menu_request: "รายการขอเบิกพัสดุ", menu_damage: "รายงานของชำรุด", menu_users: "รายชื่อพนักงาน",
        menu_logout: "ออกจากระบบ", title_inv: "พัสดุคงคลัง", title_req: "ขอเบิกพัสดุ", title_dmg: "ของชำรุด/สูญหาย",
        title_users: "รายชื่อพนักงาน", btn_add: "เพิ่มพัสดุ", btn_req: "ทำเรื่องขอเบิก", btn_dmg: "แจ้งชำรุด", btn_add_user: "เพิ่มพนักงาน",
        th_id: "รหัสพัสดุ", th_item: "ชื่อรายการ", th_qty: "คงเหลือ", th_unit: "หน่วยนับ", th_status: "สถานะ", th_action: "จัดการ",
        th_req_id: "รหัสใบเบิก", th_req_by: "ผู้ขอเบิก", th_qty_req: "จำนวน", th_date: "วันที่", th_reason: "สาเหตุ", 
        th_name: "ชื่อ-นามสกุล", th_role: "ตำแหน่ง", txt_approve: "อนุมัติ", txt_reject: "ไม่อนุมัติ", txt_cancel: "ยกเลิก", 
        txt_edit: "แก้ไข", txt_update: "ปรับยอด", btn_del: "ลบ", stat_pending: "รออนุมัติ", stat_approved: "อนุมัติแล้ว", stat_normal: "ปกติ", 
        stat_low: "ใกล้หมด", stat_out: "หมดสต๊อก", stat_done: "ดำเนินการแล้ว", msg_empty: "ไม่มีข้อมูลในระบบ", confirm_del: "ยืนยันการลบ?", text_del: "คุณต้องการลบรายการนี้ใช่หรือไม่?"
    },
    en: {
        sys_desc: "Housekeeping Inventory Control System", sign_in: "Sign In", login_sub: "Enter your Employee ID to access",
        emp_id: "Employee ID", password: "Password", btn_login: "Sign In", sys_title: "Inventory Dashboard",
        menu_inventory: "Inventory", menu_request: "Requisitions", menu_damage: "Damage Reports", menu_users: "Staff List",
        menu_logout: "Sign Out", title_inv: "Inventory Stock", title_req: "Requisition Requests", title_dmg: "Damage & Loss",
        title_users: "Staff Directory", btn_add: "Add Item", btn_req: "New Request", btn_dmg: "Report Damage", btn_add_user: "Add Staff",
        th_id: "Item ID", th_item: "Item Name", th_qty: "In Stock", th_unit: "Unit", th_status: "Status", th_action: "Action",
        th_req_id: "Req ID", th_req_by: "Requested By", th_qty_req: "Qty", th_date: "Date", th_reason: "Reason", 
        th_name: "Full Name", th_role: "Role", txt_approve: "Approve", txt_reject: "Reject", txt_cancel: "Cancel", 
        txt_edit: "Edit", txt_update: "Adjust", btn_del: "Delete", stat_pending: "Pending", stat_approved: "Approved", stat_normal: "In Stock", 
        stat_low: "Low Stock", stat_out: "Out of Stock", stat_done: "Processed", msg_empty: "No data available", confirm_del: "Confirm Delete?", text_del: "Are you sure you want to delete this item?"
    }
};

function toggleLang() {
    currentLang = currentLang === 'th' ? 'en' : 'th';
    const btnText = currentLang === 'th' ? 'EN' : 'TH';
    document.getElementById('btn-lang').innerText = btnText;
    document.getElementById('btn-lang-app').innerText = btnText;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if(i18n[currentLang][key]) el.innerText = i18n[currentLang][key];
    });
    if(currentUser) { buildMenu(); renderAllData(); }
}
document.addEventListener('DOMContentLoaded', () => toggleLang());

function toggleMobileMenu() {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('mobile-overlay').classList.toggle('active');
}

let currentUser = null;
let localDB = { users: [], inventory: [], requests: [], damages: [] };

async function login() {
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();
    try {
        const userDoc = await db.collection('users').doc(u).get();
        if (userDoc.exists && userDoc.data().pass === p) {
            currentUser = { id: userDoc.id, ...userDoc.data() };
            document.getElementById('login-view').style.display = 'none';
            document.getElementById('app-view').style.display = 'flex';
            document.getElementById('user-name-display').innerText = currentUser.name;
            document.getElementById('user-role-display').innerText = currentUser.roleName;
            buildMenu(); navigate('view-inventory', null); startRealtimeUpdates(); 
        } else {
            Swal.fire({ title: 'ข้อผิดพลาด', text: 'รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง', icon: 'error' });
        }
    } catch (error) {
        Swal.fire({ title: 'การเชื่อมต่อขัดข้อง', text: 'ไม่สามารถติดต่อฐานข้อมูล Firebase ได้', icon: 'error' });
    }
}

function logout() {
    currentUser = null;
    document.getElementById('app-view').style.display = 'none';
    document.getElementById('login-view').style.display = 'flex';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('sidebar').classList.remove('active');
    document.getElementById('mobile-overlay').classList.remove('active');
}

function buildMenu() {
    const t = i18n[currentLang];
    let html = '';
    if (currentUser.role === 'admin') {
        html += `<div class="nav-item active" onclick="navigate('view-inventory', this)"><i class="fas fa-boxes"></i> ${t.menu_inventory}</div>`;
        html += `<div class="nav-item" onclick="navigate('view-requests', this)"><i class="fas fa-clipboard-list"></i> ${t.menu_request}</div>`;
        html += `<div class="nav-item" onclick="navigate('view-damages', this)"><i class="fas fa-exclamation-circle"></i> ${t.menu_damage}</div>`;
        html += `<div class="nav-item" onclick="navigate('view-users', this)"><i class="fas fa-users"></i> ${t.menu_users}</div>`;
        document.getElementById('btn-add-item').style.display = 'inline-block';
        document.getElementById('inv-action-th').style.display = 'table-cell';
        document.getElementById('btn-create-req').style.display = 'none';
        document.getElementById('btn-report-dmg').style.display = 'none';
    } else {
        html += `<div class="nav-item active" onclick="navigate('view-inventory', this)"><i class="fas fa-boxes"></i> ${t.menu_inventory}</div>`;
        html += `<div class="nav-item" onclick="navigate('view-requests', this)"><i class="fas fa-hand-holding"></i> ${t.menu_request}</div>`;
        html += `<div class="nav-item" onclick="navigate('view-damages', this)"><i class="fas fa-exclamation-circle"></i> ${t.menu_damage}</div>`;
        document.getElementById('btn-add-item').style.display = 'none';
        document.getElementById('inv-action-th').style.display = 'none';
        document.getElementById('btn-create-req').style.display = 'inline-block';
        document.getElementById('btn-report-dmg').style.display = 'inline-block';
    }
    document.getElementById('nav-menu').innerHTML = html;
}

function navigate(viewId, el) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    if(el) {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        el.classList.add('active');
    }
    if(window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('active');
        document.getElementById('mobile-overlay').classList.remove('active');
    }
}

function startRealtimeUpdates() {
    db.collection("inventory").onSnapshot(snap => { localDB.inventory = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })); renderAllData(); });
    db.collection("requests").onSnapshot(snap => { localDB.requests = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })); renderAllData(); });
    db.collection("damages").onSnapshot(snap => { localDB.damages = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })); renderAllData(); });
    db.collection("users").onSnapshot(snap => { localDB.users = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })); renderAllData(); });
}

function renderAllData() {
    const t = i18n[currentLang];
    let invHtml = localDB.inventory.map(item => {
        let statText = item.qty > 20 ? t.stat_normal : (item.qty > 0 ? t.stat_low : t.stat_out);
        let badgeColor = item.qty > 20 ? 'background:#ecfdf5; color:#059669;' : (item.qty > 0 ? 'background:#fffbeb; color:#b45309;' : 'background:#fef2f2; color:#dc2626;');
        let actionBtn = currentUser.role === 'admin' ? `<td style="display:table-cell;"><button class="btn-action bg-success" onclick="openAdjustModal('${item.id}', ${item.qty})">${t.txt_update}</button> <button class="btn-action bg-danger" onclick="deleteInventoryItem('${item.id}')">${t.btn_del}</button></td>` : '';
        return `<tr><td style="color:#64748b;">${item.id}</td><td><b style="color:#0f172a;">${item.name}</b></td><td>${item.qty}</td><td>${item.unit}</td><td><span class="badge" style="${badgeColor}">${statText}</span></td>${actionBtn}</tr>`;
    }).join('');
    document.getElementById('inventory-list').innerHTML = invHtml;

    const myReqs = currentUser.role === 'admin' ? localDB.requests : localDB.requests.filter(r => r.userId === currentUser.id);
    let reqHtml = myReqs.length === 0 ? `<tr><td colspan="6" style="text-align:center; padding:30px; color:#94a3b8;">${t.msg_empty}</td></tr>` : myReqs.map(req => {
        let statText = req.status === 'รออนุมัติ' ? t.stat_pending : (req.status === 'อนุมัติแล้ว' ? t.stat_approved : t.txt_reject);
        let statColor = req.status === 'รออนุมัติ' ? '#b45309' : (req.status === 'อนุมัติแล้ว' ? '#059669' : '#dc2626');
        let bg = req.status === 'รออนุมัติ' ? '#fffbeb' : (req.status === 'อนุมัติแล้ว' ? '#ecfdf5' : '#fef2f2');
        let actions = req.status === 'รออนุมัติ' ? (currentUser.role === 'admin' ? `<button class="btn-action bg-success" onclick="approveReq('${req.id}','${req.item}',${req.qty})">${t.txt_approve}</button> <button class="btn-action bg-danger" onclick="rejectReq('${req.id}')">${t.txt_reject}</button>` : `<button class="btn-action bg-danger" onclick="cancelReq('${req.id}')">${t.txt_cancel}</button>`) : `<span style="font-size:12px; color:#94a3b8;">${t.stat_done}</span>`;
        return `<tr><td style="color:#64748b;">${req.id}</td><td>${req.userName}</td><td><b style="color:#0f172a;">${req.item}</b></td><td>${req.qty}</td><td><span class="badge" style="background:${bg}; color:${statColor};">${statText}</span></td><td>${actions}</td></tr>`;
    }).join('');
    document.getElementById('requests-list').innerHTML = reqHtml;

    document.getElementById('damages-list').innerHTML = localDB.damages.map(d => `<tr><td>${d.date}</td><td>${d.userName}</td><td><b style="color:#0f172a;">${d.item}</b></td><td style="color:var(--danger); font-weight:bold;">${d.qty}</td><td>${d.reason}</td></tr>`).join('');
    if(currentUser.role === 'admin') {
        document.getElementById('users-list').innerHTML = localDB.users.map(u => `<tr><td>${u.id}</td><td><b style="color:#0f172a;">${u.name}</b></td><td>${u.roleName}</td><td><button class="btn-outline" style="padding:4px 10px;" onclick="openEditUserModal('${u.id}', '${u.name}')">${t.txt_edit}</button></td></tr>`).join('');
    }
}

//  ฟังก์ชันดาวน์โหลด CSV
function exportCSV(type) {
    let data = type === 'requests' ? localDB.requests : localDB.damages;
    if (data.length === 0) return Swal.fire({ icon: 'info', title: 'ไม่มีข้อมูล', text: 'ไม่พบข้อมูลสำหรับส่งออก' });
    
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    if (type === 'requests') {
        csvContent += "รหัสใบเบิก,ผู้ขอเบิก,รายการ,จำนวน,สถานะ\n";
        data.forEach(r => csvContent += `${r.id},${r.userName},${r.item},${r.qty},${r.status}\n`);
    } else {
        csvContent += "วันที่,ผู้แจ้ง,รายการ,จำนวน,สาเหตุ\n";
        data.forEach(d => csvContent += `${d.date},${d.userName},${d.item},${d.qty},${d.reason}\n`);
    }
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `report_${type}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ==========================================
// CRUD Functions
// ==========================================
async function deleteInventoryItem(id) {
    const t = i18n[currentLang];
    const { isConfirmed } = await Swal.fire({ title: t.confirm_del, text: t.text_del, icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: t.btn_del, cancelButtonText: t.txt_cancel });
    if (isConfirmed) { await db.collection("inventory").doc(id).delete(); Swal.fire({ title: 'สำเร็จ', text: 'ลบข้อมูลเรียบร้อย', icon: 'success' }); }
}

async function openProfileModal() {
    const { value: formValues } = await Swal.fire({
        title: 'ตั้งค่าบัญชีผู้ใช้', 
        html: `<div class="custom-form-group"><label>รหัสพนักงาน</label><input type="text" value="${currentUser.id}" disabled></div><div class="custom-form-group"><label>ชื่อ-นามสกุล</label><input id="swal-prof-name" type="text" value="${currentUser.name}"></div><div class="custom-form-group"><label>รหัสผ่านใหม่ (ปล่อยว่างถ้าไม่เปลี่ยน)</label><input id="swal-prof-pass" type="password" placeholder="••••••••"></div>`,
        showCancelButton: true, confirmButtonText: 'บันทึก', cancelButtonText: 'ยกเลิก',
        preConfirm: () => [document.getElementById('swal-prof-name').value, document.getElementById('swal-prof-pass').value]
    });
    if (formValues && formValues[0]) {
        let updates = { name: formValues[0] };
        if (formValues[1]) updates.pass = formValues[1];
        await db.collection("users").doc(currentUser.id).update(updates);
        currentUser.name = formValues[0]; document.getElementById('user-name-display').innerText = currentUser.name;
        Swal.fire({ title: 'สำเร็จ', text: 'อัปเดตข้อมูลส่วนตัวแล้ว', icon: 'success' });
    }
}

async function openAddModal() {
    const { value: formValues } = await Swal.fire({
        title: 'เพิ่มพัสดุใหม่',
        html: `<div class="custom-form-group"><label>ชื่อพัสดุ</label><input id="swal-name" type="text" placeholder="เช่น น้ำยาเช็ดกระจก"></div><div class="custom-form-group"><label>จำนวนเริ่มต้น</label><input id="swal-qty" type="number" placeholder="ระบุตัวเลข"></div><div class="custom-form-group"><label>หน่วยนับ</label><input id="swal-unit" type="text" placeholder="เช่น ขวด, แกลลอน, ชิ้น"></div>`,
        focusConfirm: false, showCancelButton: true, confirmButtonText: 'บันทึกข้อมูล', cancelButtonText: 'ยกเลิก',
        preConfirm: () => [document.getElementById('swal-name').value, document.getElementById('swal-qty').value, document.getElementById('swal-unit').value]
    });
    if (formValues && formValues[0] && formValues[1]) {
        const newId = 'INV-' + String(localDB.inventory.length + 1).padStart(3, '0');
        await db.collection("inventory").doc(newId).set({ name: formValues[0], qty: parseInt(formValues[1]), unit: formValues[2] || 'ชิ้น' });
        Swal.fire({ title: 'สำเร็จ', text: 'เพิ่มพัสดุเข้าคลังเรียบร้อย', icon: 'success' });
    }
}

async function openAdjustModal(id, currentQty) {
    const { value: newQty } = await Swal.fire({
        title: 'ปรับยอดคงเหลือ', 
        html: `<div class="custom-form-group"><label>รหัสพัสดุ</label><input type="text" value="${id}" disabled></div><div class="custom-form-group"><label>จำนวนคงเหลือล่าสุด</label><input id="swal-new-qty" type="number" value="${currentQty}"></div>`,
        showCancelButton: true, confirmButtonText: 'บันทึก', cancelButtonText: 'ยกเลิก',
        preConfirm: () => document.getElementById('swal-new-qty').value
    });
    if (newQty !== undefined && newQty !== "") {
        await db.collection("inventory").doc(id).update({ qty: parseInt(newQty) });
        Swal.fire({ title: 'สำเร็จ', text: 'อัปเดตสต๊อกแล้ว', icon: 'success' });
    }
}

async function openReqModal() {
    if(localDB.inventory.length === 0) return Swal.fire({ title: 'แจ้งเตือน', text: 'ไม่มีพัสดุในคลังให้เบิก', icon: 'warning' });
    let opts = localDB.inventory.map(item => `<option value="${item.name}">${item.name} (คงเหลือ: ${item.qty} ${item.unit})</option>`).join('');
    const { value: formValues } = await Swal.fire({
        title: 'สร้างใบขอเบิกพัสดุ', 
        html: `<div class="custom-form-group"><label>เลือกรายการพัสดุ</label><select id="swal-item">${opts}</select></div><div class="custom-form-group"><label>จำนวนที่ต้องการเบิก</label><input id="swal-req-qty" type="number" placeholder="ระบุจำนวน"></div>`,
        focusConfirm: false, showCancelButton: true, confirmButtonText: 'ส่งคำขอเบิก', cancelButtonText: 'ยกเลิก',
        preConfirm: () => [document.getElementById('swal-item').value, document.getElementById('swal-req-qty').value]
    });
    if (formValues && formValues[1]) {
        await db.collection("requests").doc('REQ-' + Math.floor(1000 + Math.random() * 9000)).set({
            userId: currentUser.id, userName: currentUser.name, item: formValues[0], qty: parseInt(formValues[1]), status: 'รออนุมัติ'
        });
        Swal.fire({ title: 'สำเร็จ', text: 'ส่งคำขอเบิกแล้ว', icon: 'success' });
    }
}

async function approveReq(reqId, itemName, requestQty) {
    await db.collection("requests").doc(reqId).update({ status: 'อนุมัติแล้ว' });
    const itemObj = localDB.inventory.find(i => i.name === itemName);
    if(itemObj) await db.collection("inventory").doc(itemObj.id).update({ qty: Math.max(0, itemObj.qty - requestQty) });
}
async function rejectReq(reqId) { await db.collection("requests").doc(reqId).update({ status: 'ไม่อนุมัติ' }); }
async function cancelReq(reqId) { await db.collection("requests").doc(reqId).delete(); }

async function openDmgModal() {
    const { value: formValues } = await Swal.fire({
        title: 'แจ้งพัสดุชำรุด', 
        html: `<div class="custom-form-group"><label>รายการที่ชำรุด</label><input id="swal-dmg-item" type="text" placeholder="ระบุชื่อสิ่งของ"></div><div class="custom-form-group"><label>จำนวน</label><input id="swal-dmg-qty" type="number" placeholder="ระบุจำนวน"></div><div class="custom-form-group"><label>สาเหตุ</label><input id="swal-dmg-reason" type="text" placeholder="เช่น แตก, ขาด, เสื่อมสภาพ"></div>`,
        focusConfirm: false, showCancelButton: true, confirmButtonText: 'แจ้งเรื่อง', cancelButtonText: 'ยกเลิก',
        preConfirm: () => [document.getElementById('swal-dmg-item').value, document.getElementById('swal-dmg-qty').value, document.getElementById('swal-dmg-reason').value]
    });
    if (formValues && formValues[0]) {
        await db.collection("damages").add({ date: new Date().toLocaleDateString('en-GB'), userName: currentUser.name, item: formValues[0], qty: parseInt(formValues[1]), reason: formValues[2] || 'ไม่ระบุ' });
        Swal.fire({ title: 'สำเร็จ', text: 'บันทึกประวัติชำรุดแล้ว', icon: 'success' });
    }
}

async function openUserModal() {
    const { value: fv } = await Swal.fire({
        title: 'เพิ่มข้อมูลพนักงาน', 
        html: `<div class="custom-form-group"><label>รหัสพนักงาน</label><input id="swal-u-id" type="text" placeholder="เช่น HK-03"></div><div class="custom-form-group"><label>ชื่อ-นามสกุล</label><input id="swal-u-name" type="text" placeholder="ระบุชื่อพนักงาน"></div><div class="custom-form-group"><label>ตั้งรหัสผ่าน (เริ่มต้น)</label><input id="swal-u-pass" type="text" placeholder="กำหนดรหัสผ่าน"></div><div class="custom-form-group"><label>ระดับสิทธิ์การใช้งาน</label><select id="swal-u-role"><option value="user">Housekeeper (พนักงานแม่บ้าน)</option><option value="admin">Warehouse Admin (ผู้ดูแลคลัง)</option></select></div>`,
        focusConfirm: false, showCancelButton: true, confirmButtonText: 'บันทึก', cancelButtonText: 'ยกเลิก',
        preConfirm: () => [document.getElementById('swal-u-id').value, document.getElementById('swal-u-name').value, document.getElementById('swal-u-pass').value, document.getElementById('swal-u-role').value]
    });
    if (fv && fv[0] && fv[1]) {
        await db.collection("users").doc(fv[0]).set({ name: fv[1], pass: fv[2] || '1234', role: fv[3], roleName: fv[3] === 'admin' ? 'Warehouse Admin' : 'Housekeeper' });
        Swal.fire({ title: 'สำเร็จ', text: 'เพิ่มพนักงานเรียบร้อย', icon: 'success' });
    }
}

async function openEditUserModal(id, oldName) {
    const { value: newName } = await Swal.fire({ 
        title: `แก้ไขข้อมูลพนักงาน`, 
        html: `<div class="custom-form-group"><label>รหัสพนักงาน</label><input type="text" value="${id}" disabled></div><div class="custom-form-group"><label>ชื่อ-นามสกุล</label><input id="swal-edit-name" type="text" value="${oldName}"></div>`,
        showCancelButton: true, confirmButtonText: 'บันทึก', cancelButtonText: 'ยกเลิก',
        preConfirm: () => document.getElementById('swal-edit-name').value
    });
    if (newName) {
        await db.collection("users").doc(id).update({ name: newName });
        Swal.fire({ title: 'สำเร็จ', text: 'อัปเดตข้อมูลพนักงานแล้ว', icon: 'success' });
    }
}