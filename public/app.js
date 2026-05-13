function showToast(msg){

  var toast = document.getElementById("toast");

  toast.innerText = msg;

  toast.classList.add("show");

  setTimeout(function(){
    toast.classList.remove("show");
  },2000);

}

// ===== STORAGE =====
var historyData = JSON.parse(localStorage.getItem("bills")) || [];

window.onload = function(){
  updateUI();
  loadCustomers();

  document.getElementById("name").focus();
};

// ===== HELPERS =====
function val(id){
  return document.getElementById(id)?.value || "";
}

function set(id,v){
  if(document.getElementById(id)){
    document.getElementById(id).innerText = v;
  }
}

function formatRupee(n){
  return "₹" + Number(n).toLocaleString("en-IN");
}
function drawMultilineText(ctx, text, x, y, maxWidth, lineHeight) {
  var words = (text || "").split(" ");
  var line = "";

  for (var i = 0; i < words.length; i++) {
    var testLine = line + words[i] + " ";
    var width = ctx.measureText(testLine).width;

    if (width > maxWidth && i > 0) {
      ctx.fillText(line, x, y);
      line = words[i] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }

  ctx.fillText(line, x, y);
}


// ===== IMAGE =====
function loadImage(src){
  return new Promise(function(resolve){
    var img = new Image();
    img.src = src;
    img.onload = ()=>resolve(img);
    img.onerror = ()=>resolve(null);
  });
}

// ===== GENERATE =====
async function generateBill(){

  var now = new Date();

  var data = {
    name: val("name"),
    address: val("address"),
    phone: val("phone"),
    cycle: val("cycle"),
    cycleno: val("cycleno"),
    qty: Number(val("qty") || 0),
    amount: Number(val("amount") || 0),
    status: val("status"),
    mode: val("mode"),
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}),
    billNo: Date.now()
  };

  if(!data.name || data.amount<=0){
    alert("Enter valid data");
    return;
  }

  historyData.unshift(data);
  localStorage.setItem("bills", JSON.stringify(historyData));

  await drawBill(data);
  updateUI();


}

// ===== DRAW BILL =====
async function drawBill(d){

  var canvas = document.getElementById("billCanvas");
  var ctx = canvas.getContext("2d");

  ctx.textBaseline = "top";

  canvas.width = 1200;
  canvas.height = 1900;
  ctx.scale(2,2);

  // white background
  ctx.fillStyle="#ffffff";
  ctx.fillRect(0,0,600,950);

  var logo = await loadImage("logo.png");
  var owner = await loadImage("owner.jpg");
  var cycleImg = await loadImage("cycle.png");

  // ===== HEADER =====
  var grad = ctx.createLinearGradient(0,0,600,0);
  grad.addColorStop(0,"#1e3a8a");
  grad.addColorStop(1,"#3b82f6");

  ctx.fillStyle = grad;
  ctx.fillRect(0,0,600,95);

  ctx.fillStyle="#ffffff30";
  ctx.fillRect(0,90,600,2);

  if(logo){
    ctx.fillStyle="#fff";
    ctx.beginPath();
    ctx.arc(50,48,28,0,Math.PI*2);
    ctx.fill();
    ctx.drawImage(logo,25,23,50,50);
  }

  ctx.fillStyle="#fff";
  ctx.font="bold 20px Arial";
  ctx.fillText("BISWAKARMA CYCLE STORE",100,40);

  ctx.font="14px Arial";
  ctx.fillStyle="#dbeafe";
  ctx.fillText("Agarapada, Bhadrak",100,65);

  if(owner){
    ctx.save();
    ctx.beginPath();
    ctx.arc(540,48,26,0,Math.PI*2);
    ctx.clip();
    ctx.drawImage(owner,514,22,52,52);
    ctx.restore();

    ctx.strokeStyle="#fff";
    ctx.lineWidth=2;
    ctx.beginPath();
    ctx.arc(540,48,26,0,Math.PI*2);
    ctx.stroke();
  }

  // ===== INFO =====
  ctx.fillStyle="#000";
  ctx.font="15px Arial";

  ctx.fillText("Bill No: #"+d.billNo.toString().slice(-4),30,120);
  ctx.fillText("Date: "+d.date,420,110);
  ctx.fillText("Time: "+d.time,420,130);

  // ===== CUSTOMER =====
  ctx.fillStyle="#f8fafc";
  ctx.fillRect(20,150,560,150);

  ctx.fillStyle="#1e3a8a";
  ctx.font="bold 17px Arial";
  ctx.fillText("Customer Details",30,175);

  ctx.fillStyle="#000";
  ctx.font="15px Arial";
  ctx.fillText("Name: "+(d.name||"-"),30,205);
  ctx.fillText("Address: "+(d.address||"-"),30,230);
  ctx.fillText("Phone: "+(d.phone||"-"),30,255);
  ctx.fillText("Cycle No: "+(d.cycleno||"-"),30,280);

  // ===== TABLE =====
  ctx.fillStyle="#eef2ff";
  ctx.fillRect(30,330,540,35);

  ctx.fillStyle="#000";
  ctx.font="bold 15px Arial";
  ctx.fillText("Cycle",100,315);
  ctx.fillText("Qty",350,315);
  ctx.fillText("Amount",450,315);

var startY = 350;

// split text into lines
var words = (d.cycle || "").split(" ");
var line = "";
var lines = [];

for (var i = 0; i < words.length; i++) {
  var testLine = line + words[i] + " ";
  var width = ctx.measureText(testLine).width;

  if (width > 220 && i > 0) {
    lines.push(line);
    line = words[i] + " ";
  } else {
    line = testLine;
  }
}
lines.push(line);

// height calculate
var rowHeight = lines.length * 18;

// draw cycle text
lines.forEach(function(l, index){
  ctx.fillText(l, 100, startY + (index * 18));
});

// center qty & amount
var middleY = startY + (rowHeight / 2) - 9;

ctx.fillText(d.qty, 350, middleY);

ctx.textAlign="right";
ctx.fillText(formatRupee(d.amount), 530, middleY);
ctx.textAlign="left";
  // ===== TOTAL =====
  ctx.fillStyle="#dbeafe";
  ctx.fillRect(30, startY + rowHeight + 40, 260, 50);

  ctx.fillStyle="#1e40af";
  ctx.font="bold 18px Arial";
  ctx.fillText("Total: "+formatRupee(d.amount),45, startY + rowHeight + 70);
  // STATUS
  ctx.fillStyle = d.status==="PAID" ? "#dcfce7" : "#fee2e2";
  ctx.fillRect(330, startY + rowHeight + 45, 120, 35);

  ctx.fillStyle = d.status==="PAID" ? "#166534" : "#991b1b";
  ctx.fillText(d.status,360, startY + rowHeight + 68);

  ctx.fillStyle="#000";
  ctx.fillText("Mode: "+d.mode,30, startY + rowHeight + 110);

  // ===== WHY CHOOSE =====
  var whyY = startY + rowHeight + 150;

  ctx.fillStyle="#1e3a8a";
  ctx.font="bold 16px Arial";
  ctx.fillText("Why Choose Us",30,whyY);

  ctx.fillStyle="#374151";
  ctx.font="14px Arial";
  ctx.fillText("✔ Premium Build Quality Cycles",30,whyY+30);
  ctx.fillText("✔ Best Price Guarantee",30,whyY+55);
  ctx.fillText("✔ Trusted Local Store",30,whyY+80);

  ctx.fillStyle="#6b7280";
  ctx.fillText("Call/WhatsApp: 9937510478",30,whyY+110);  
  var signY = whyY + 150;
  // ===== CYCLE IMAGE =====
  if(cycleImg){
    ctx.drawImage(cycleImg,340,whyY,210,120);
  }
//  ------ customer Signature-------

  ctx.fillStyle="#000";
  ctx.font="14px Arial";

  // label
  ctx.fillText("Customer Signature:",30,signY);

  // long line (right side)
  ctx.beginPath();
  ctx.moveTo(320,signY+10);
  ctx.lineTo(580,signY+10);
  ctx.stroke();

  // signature style name (center of line)
  ctx.textAlign="center";
  ctx.font="italic 18px cursive";
  ctx.fillText(d.name,450,signY-5);

  // reset
  ctx.textAlign="left";
  
  // ===== FOOTER =====
var footerY = signY + 60;

var footGrad = ctx.createLinearGradient(0,footerY,600,footerY+80);
footGrad.addColorStop(0,"#1e3a8a");
footGrad.addColorStop(1,"#2563eb");

ctx.fillStyle = footGrad;
ctx.fillRect(0,footerY,600,80);

ctx.textAlign="center";

ctx.fillStyle="#ffffff";
ctx.font="bold 15px Arial";
ctx.fillText("Trusted Since 2002",300,footerY+20);

ctx.font="13px Arial";
ctx.fillStyle="#dbeafe";
ctx.fillText("Quality Cycles • Best Price",300,footerY+40);

ctx.font="bold 14px Arial";
ctx.fillStyle="#ffffff";
ctx.fillText("Thanks for choosing Biswakarma",300,footerY+60);

ctx.textAlign="left";}

//------ ===== DOWNLOAD =====---------
function downloadBill(){

  var canvas = document.getElementById("billCanvas");

  if(!canvas){
    alert("Canvas not found");
    return;
  }

  var img = canvas.toDataURL("image/png");

  if(!img){
    alert("Generate bill first");
    return;
  }

  var a = document.createElement("a");
  a.href = img;
  var now = new Date();
var now = new Date();

var name =
now.getFullYear() + "-" +
String(now.getMonth()+1).padStart(2,'0') + "-" +
String(now.getDate()).padStart(2,'0') + "_" +
String(now.getHours()).padStart(2,'0') + "-" +
String(now.getMinutes()).padStart(2,'0');
a.download = name + ".png";
  a.click();
}


// ----- ===== SINGLE PAGE PDF =====------
async function downloadSinglePDF(){

  const { jsPDF } = window.jspdf;

  var canvas = document.getElementById("billCanvas");

  if(!canvas){
    alert("Generate bill first");
    return;
  }

  var billImg = canvas.toDataURL("image/png");

  var pdf = new jsPDF("p","mm","a4");

  // full page fit
  pdf.addImage(billImg,"PNG",0,0,210,297);

  var now = new Date();
  var name = "BILL_" + now.getFullYear() +
             (now.getMonth()+1) +
             now.getDate() + "_" +
             now.getHours() +
             now.getMinutes();

  pdf.save(name + ".pdf");
}

// -----share whatshap-----

function shareWhatsApp(){

  var phone = val("phone");

  if(!phone){
    alert("Enter phone number");
    return;
  }

  // clean number
  phone = phone.replace(/\D/g,'');

  if(phone.length === 10){
    phone = "91"+phone;
  }

  
  

  // 2️⃣ slight delay (important)
  setTimeout(function(){
    var name = val("name") || "Customer";
  var amount = val("amount") || "0";
  var cycle = val("cycle") || "Cycle";
  var billNo = Date.now().toString().slice(-4);

var text =
"Hello *" + name + "* 👋\n\n" +

"✨ *Thank you for choosing*\n" +
"🚲 *Biswakarma Cycle Store* 🚲\n\n" +

"━━━━━━━━━━━━━━\n" +
"📦 *BILL SUMMARY*\n" +
"━━━━━━━━━━━━━━\n\n" +

"🧾 Bill No : *" + billNo + "*\n" +
"🚲 Cycle : *" + cycle + "*\n" +
"🔖 Cycle No : *" + val("cycleno") + "*\n" +
"🔢 Quantity : *" + val("qty") + "*\n" +
"💰 Amount : *₹" + amount + "*\n" +
"💳 Payment Mode : *" + val("mode") + "*\n" +
"📅 Date : *" + new Date().toLocaleDateString("en-GB") + "*\n\n" +

"━━━━━━━━━━━━━━\n\n" +

"✅ Your bill has been successfully generated.\n\n" +

"🛠 We also provide:\n" +
"• Cycle Service\n" +
"• Spare Parts\n" +
"• Accessories\n\n" +

"📍 *Store Address:*\n" +
"Biswakarma Cycle Store\n" +
"Agarapada, Near Laxmi Bajar\n\n" +

"📞 *Contact:* 9937510478\n\n" +

"🙏 Visit Again 🚴\n\n" +

"_— Pratap Chandra Rout_\n" +
"*Biswakarma Cycle Store*";
window.open(
"https://wa.me/" + phone + "?text=" + encodeURIComponent(text)
);

},700);

}

// ===== UI =====
function updateUI(){

  var ts=0, ta=0;

  historyData.forEach(function(i){
    ts += i.qty || 0;
    ta += i.amount || 0;
  });

  set("todaySales",ts);
  set("todayAmount",formatRupee(ta));
  set("totalSales",ts);
  set("totalAmount",formatRupee(ta));
  var now = new Date();

  var week = 0;
  var month = 0;
  var map = {};

historyData.forEach(function(i){

  var d = new Date(i.date);
  var diff = (now - d)/(1000*60*60*24);

  if(diff <= 7) week += i.amount || 0;
  if(diff <= 30) month += i.amount || 0;

  var c = i.cycle || "Other";
  map[c] = (map[c] || 0) + (i.qty || 0);
});

document.getElementById("weekSales").innerText = "₹"+week;
document.getElementById("monthSales").innerText = "₹"+month;

var txt="";
for(var k in map){
  txt += k + ":" + map[k] + " ";
}
document.getElementById("topCycles").innerText = txt;

  renderHistory();
}
function renderHistory(){

  var box = document.getElementById("historyList");
  if(!box) return;

  box.innerHTML = "";

  historyData.forEach(function(i,index){

    var div = document.createElement("div");
    div.className = "historyItem";

    div.innerHTML = `
      <div class="historyLeft">
        <b>${i.name}</b><br>
        ${i.cycle}
      </div>

      <div class="historyRight">
        ₹${i.amount}<br>
        <button class="deleteBtn" onclick="deleteItem(${index})">Delete</button>
      </div>
    `;

    div.onclick = function(e){
      if(e.target.tagName === "BUTTON") return;
      drawBill(i);
    };

    box.appendChild(div);
  });
}


function deleteItem(index){
  historyData.splice(index,1);
  localStorage.setItem("bills",JSON.stringify(historyData));
  updateUI();
}


function searchHistory(){

  var s = document.getElementById("searchInput").value.toLowerCase();
  var box = document.getElementById("historyList");

  box.innerHTML = "";

  historyData.forEach(function(i,index){

    if(
      i.name.toLowerCase().includes(s) ||
      i.billNo.toString().includes(s)
    ){

      var div = document.createElement("div");
      div.className = "historyItem";

      div.innerHTML = `
        <div class="historyLeft">
          <b>${i.name}</b><br>
          ${i.cycle}
        </div>

        <div class="historyRight">
          ₹${i.amount}<br>
          <button class="deleteBtn" onclick="deleteItem(${index})">Delete</button>
        </div>
      `;

      box.appendChild(div);
    }

  });
}

async function addCustomer(){

  var data = {
    name: val("pName"),
    phone: val("pPhone"),
    address: val("pAddress")
  };

  var res = await fetch("/add-customer",{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify(data)
  });

  var msg = await res.text();
  var ctx = new (
window.AudioContext ||
window.webkitAudioContext
)();

var osc = ctx.createOscillator();

var gain = ctx.createGain();

osc.type = "sine";

osc.frequency.value = 700;

osc.connect(gain);

gain.connect(ctx.destination);

gain.gain.value = 0.08;

osc.start();

setTimeout(function(){

  osc.stop();

},120);

  showToast(msg);

  loadCustomers();
}


async function addPending(){

  var data = {
    phone: val("duePhone"),
    amount: Number(val("dueAmount"))
  };

  var res = await fetch("/add-udhar",{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify(data)
  });

  var msg = await res.text();

  alert(msg);

  loadCustomers();
}


async function collectPayment(){

  var data = {
    phone: val("payPhone"),
    amount: Number(val("payAmount"))
  };

  var res = await fetch("/payment",{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify(data)
  });

  var msg = await res.text();

  alert(msg);

  loadCustomers();
}


async function loadCustomers(){

  var res = await fetch("/customers");

  var customers = await res.json();

  var box = document.getElementById("customerList");

  box.innerHTML = "";

  customers.forEach(function(c){

    var div = document.createElement("div");

    div.style.background = "#fff";
    div.style.padding = "14px";
    div.style.margin = "12px 0";
    div.style.borderRadius = "16px";

   div.innerHTML = `

<div style="
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:10px;
">

<div style="
font-size:19px;
font-weight:bold;
color:#0f172a;
">
${c.name}
</div>

<div style="
background:#dbeafe;
color:#2563eb;
padding:5px 12px;
border-radius:20px;
font-size:12px;
font-weight:bold;
">
Customer
</div>

</div>

<div style="
background:#f8fafc;
padding:10px 12px;
border-radius:12px;
font-size:15px;
color:#475569;
margin-bottom:10px;
">
📞 ${c.phone}
</div>

<div style="
background:#f8fafc;
padding:12px;
border-radius:14px;
margin-bottom:12px;
">

<div style="
font-size:15px;
color:#2563eb;
font-weight:bold;
">
Total : ₹${c.total || 0}
</div>

<div style="
margin-top:6px;
font-size:20px;
font-weight:bold;
color:#ea580c;
">
Remaining : ₹${c.balance}
</div>

</div>
<div style="
display:flex;
gap:10px;
">

<button
class="generate"
style="
flex:1;
height:48px;
border-radius:14px;
"
onclick="
document.getElementById('duePhone').value='${c.phone}';
document.getElementById('dueAmount').focus();
">
Add
</button>

<button
class="whatsapp"
style="
flex:1;
height:48px;
border-radius:14px;
"
onclick="
openPaymentModal(
'${c.name}',
'${c.phone}',
'${c.balance}'
)
">
Collect
</button>


<button
class="generate"
style="
flex:1;
height:48px;
border-radius:14px;
"
onclick="
openHistory(
'${c.name}',
'${c.phone}'
)
">
History
</button>

<button
class="Reminder"
style="
flex:1;
height:48px;
border-radius:14px;
"
onclick="
sendHistory(
'${c.name}',
'${c.phone}',
'${c.balance}'
)
">
Reminder
</button>

<button
style="
flex:1;
height:48px;
border:none;
border-radius:14px;
background:#dc2626;
color:#fff;
font-weight:bold;
"
onclick="
deleteCustomer('${c.phone}')
">
Delete
</button>


</div>

`;

    box.appendChild(div);

  });

}

var currentCustomerPhone = "";

function openPaymentModal(name, phone, balance){

  currentCustomerPhone = phone;

  document.getElementById("paymentModal").style.display = "flex";

  document.getElementById("modalCustomerName").innerText = name;

  document.getElementById("modalBalance").innerText =
  "Remaining ₹" + balance;
  setTimeout(function(){

  document
  .getElementById("modalAmount")
  .focus();

},200);

}

function closePaymentModal(){

  document.getElementById("paymentModal").style.display = "none";

}

async function saveModalPayment(){

  var amount =
  document.getElementById("modalAmount").value;

  var data = {
    phone: currentCustomerPhone,
    amount: Number(amount)
  };

  var res = await fetch("/payment",{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify(data)
  });

  var msg = await res.text();
  var currentBalance =
parseInt(
document
.getElementById("modalBalance")
.innerText
.replace(/\D/g,'')
);

var customerName =
document
.getElementById("modalCustomerName")
.innerText;

var paidAmount = Number(amount);

var remaining =
currentBalance - paidAmount;

var speechText = "";

if(remaining > 0){

  speechText =
  `${customerName}, payment received. Remaining amount is ${remaining} rupees`;

}else{

  speechText =
  `${customerName}, payment completed successfully`;

}

var speech =
new SpeechSynthesisUtterance(speechText);

speech.lang = "en-IN";

speech.rate = 0.92;

speech.pitch = 1;

speech.volume = 1;

window.speechSynthesis.cancel();

setTimeout(function(){

  window.speechSynthesis.speak(speech);

},250);

  showToast(msg);

  closePaymentModal();

  loadCustomers();

}

function sendReminder(name, phone, balance){

  phone = phone.replace(/\D/g,'');

  if(phone.length === 10){
    phone = "91" + phone;
  }

  var text =
`Hello ${name} 👋

This is a friendly reminder from Biswakarma Cycle Store.

Your remaining pending amount is ₹${balance}.

Please clear the balance at your convenience.

🚲 Biswakarma Cycle Store
Pratap Chandra Rout
📞 9937510478`;

  window.open(
    "https://wa.me/" +
    phone +
    "?text=" +
    encodeURIComponent(text)
  );

}

async function openHistory(name, phone){

  var res =
  await fetch("/history/" + phone);

  var data =
  await res.json();

  var html = "";

  data.forEach(function(i){

    html += `
    <div style="
      background:#f8fafc;
      padding:12px;
      border-radius:12px;
      margin-top:10px;
      animation:fade 0.3s ease;
    ">

      <div style="
      font-weight:bold;
      color:#16a34a;
      font-size:18px;
      ">
      ₹${i.amount}
      </div>

      <div style="
      margin-top:4px;
      color:#475569;
      font-size:14px;
      ">
      ${i.date}
      </div>

    </div>
    `;

  });

  document.getElementById(
    "historyPopupName"
  ).innerText = name;

  document.getElementById(
    "historyPopupBody"
  ).innerHTML =
  html || "No payment history";

  document.getElementById(
    "historyPopup"
  ).style.display = "flex";

}

async function sendHistory(name, phone, balance){

  var res =
  await fetch("/history/" + phone);

  var data =
  await res.json();

  var msg =
  "Hello " + name + ",\n\n";

  msg += "Payment History\n\n";

  var total = 0;

  data.forEach(function(i){

    total += Number(i.amount);

    msg +=
    "₹" + i.amount +
    " - " + i.date + "\n";

  });

  msg +=
  "\nTotal Paid: ₹" + total;

  msg +=
  "\nRemaining Balance: ₹" + balance;

  msg +=
  "\n\n— Pratap Chandra Rout";

  window.open(
  "https://wa.me/91" +
  phone +
  "?text=" +
  encodeURIComponent(msg)
  );

}

async function downloadLedger(name, phone, balance){

  var res =
  await fetch("/history/" + phone);

  var data =
  await res.json();

  const { jsPDF } = window.jspdf;

  var pdf =
  new jsPDF();

  pdf.setFontSize(20);

  pdf.text(
    "Customer Ledger",
    20,
    20
  );

  pdf.setFontSize(14);

  pdf.text(
    "Name: " + name,
    20,
    40
  );

  pdf.text(
    "Phone: " + phone,
    20,
    50
  );

  pdf.text(
    "Remaining: ₹" + balance,
    20,
    60
  );

  var y = 80;

  var total = 0;

  data.forEach(function(i){

    total += Number(i.amount);

    pdf.text(
      "₹" + i.amount +
      " - " + i.date,
      20,
      y
    );

    y += 10;

  });

  pdf.text(
    "Total Paid: ₹" + total,
    20,
    y + 10
  );

  pdf.save(
    name + "_ledger.pdf"
  );

}

async function deleteCustomer(phone){

  var ok =
  confirm("Delete this customer?");

  if(!ok) return;

  var res =
  await fetch(
    "/delete-customer/" + phone,
    {
      method:"DELETE"
    }
  );

  var msg =
  await res.text();

  alert(msg);

  loadCustomers();

}

/* CUSTOMER SEARCH */

function searchCustomer(){

var input =
document
.getElementById("customerSearch")
.value
.toLowerCase();

var cards =
document
.querySelectorAll("#customerList > div");

cards.forEach(function(card){

var text =
card.innerText.toLowerCase();

if(text.includes(input)){

card.style.display = "block";

}else{

card.style.display = "none";

}

});

}

/* PREMIUM UI SOUND */

document.addEventListener("click",function(e){

if(
e.target.tagName === "BUTTON"
){

var ctx =
new (
window.AudioContext ||
window.webkitAudioContext
)();

var osc =
ctx.createOscillator();

var gain =
ctx.createGain();

osc.type = "triangle";

osc.frequency.value = 520;

gain.gain.value = 0.03;

osc.connect(gain);

gain.connect(ctx.destination);

osc.start();

setTimeout(function(){

osc.frequency.value = 720;

},40);

setTimeout(function(){

osc.stop();

},100);

}

});
// ----------------------------------------
// window.addEventListener("load", function(){

//   setTimeout(function(){

//     var speech = new SpeechSynthesisUtterance(
//       "Biswakarma presents"
//     );

//     speech.lang = "en-IN";

//     speech.rate = 0.9;

//     speech.pitch = 1;

//     window.speechSynthesis.speak(speech);

//   },700);

// });



// ===== PREMIUM START SOUND =====

window.addEventListener("load", function(){

  var ctx = new (
    window.AudioContext ||
    window.webkitAudioContext
  )();

  // 1st tone
  var osc1 = ctx.createOscillator();
  var gain1 = ctx.createGain();

  osc1.type = "sine";
  osc1.frequency.value = 520;

  osc1.connect(gain1);
  gain1.connect(ctx.destination);

  gain1.gain.value = 0.05;

  osc1.start();

  // 2nd premium tone
  setTimeout(function(){

    var osc2 = ctx.createOscillator();
    var gain2 = ctx.createGain();

    osc2.type = "triangle";
    osc2.frequency.value = 760;

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    gain2.gain.value = 0.05;

    osc2.start();

    setTimeout(function(){
      osc2.stop();
    },160);

  },140);

  setTimeout(function(){
    osc1.stop();
  },220);

});

window.addEventListener("load", function(){

  setTimeout(function(){

    // premium intro sound
    var ctx = new (
      window.AudioContext ||
      window.webkitAudioContext
    )();

    var osc = ctx.createOscillator();
    var gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.value = 650;

    osc.connect(gain);
    gain.connect(ctx.destination);

    gain.gain.value = 0.04;

    osc.start();

    setTimeout(function(){
      osc.stop();
    },180);

    // voice after sound
    setTimeout(function(){

      var speech =
      new SpeechSynthesisUtterance(
        "Powered by Biswakarma"
      );

      speech.lang = "en-IN";

      speech.rate = 0.86;

      speech.pitch = 0.85;

      speech.volume = 1;

      window.speechSynthesis.speak(speech);

    },220);

  },700);

});

let totalPending = 0;
let totalCollection = 0;

customers.forEach(c => {
  totalPending += Number(c.remaining || 0);
  totalCollection += Number(c.total || 0);
});

document.getElementById("totalPending").innerText = totalPending;

document.getElementById("totalCollection").innerText = totalCollection;

document.getElementById("totalCustomers").innerText = customers.length;