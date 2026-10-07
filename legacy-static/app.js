/* Follow the Fabric — data-driven interactive dyeing unit.
   DATA (plain structures) + RENDER (reusable components).
   Future modules (spinning, weaving…) reuse Department/Connection/Process shapes. */
"use strict";

/* ============================== DATA ============================== */

const CATEGORY_META = {
  production:  { label: "Production", color: "#ea580c" },
  laboratory:  { label: "Laboratory / Technical", color: "#7c3aed" },
  quality:     { label: "Quality", color: "#16a34a" },
  engineering: { label: "Engineering / Support", color: "#475569" },
  downstream:  { label: "Downstream", color: "#0ea5e9" },
  entry:       { label: "Entry", color: "#ea580c" }
};

const DEPARTMENTS = [
  { id:"grey-fabric", name:"Grey Fabric Arrival", short:"Grey Fabric", cat:"entry", icon:"🧵",
    pos:{x:430,y:8,w:220,h:56},
    beginner:"Un-dyed fabric arrives from knitting / weaving — the starting point of everything.",
    pro:"Grey (loom-state) fabric intake: lot identity, supplier, fibre/composition, width, order link. No chemical processing yet.",
    inputs:["Grey fabric lots","Purchase / order reference","Supplier documents"],
    outputs:["Identified lots handed to Grey Store","Receiving records"],
    responsibilities:["Verify arrival vs order","Label & identify lots","Hand over to store"],
    processes:["Receiving","Identification","Count / weight check"],
    equipment:["Weighing scale","Trolley / pallet","Roll stand"],
    params:["Roll no.","Lot no.","Weight (kg)","Width (inch/cm)"],
    problems:["Mixing of lots","Missing identification","Moisture / stains on arrival"] },
  { id:"grey-store", name:"Grey Fabric Store", short:"Grey Store", cat:"production", icon:"📦",
    pos:{x:430,y:82,w:220,h:82},
    beginner:"The warehouse where grey fabric is stored, tracked and issued to production.",
    pro:"Controlled storage + traceability hub: roll/lot ID, location, status (stored / reserved / issued), FIFO, weight/quantity records.",
    inputs:["Grey fabric lots","Order requirement","Storage locations"],
    outputs:["Stored rolls (traceable)","Issue to Batch with lot papers"],
    responsibilities:["Inspection / verification","Weight & quantity recording","Roll / lot identification","Storage & issue control"],
    processes:["Receiving → Identification → Inspection → Weighing → Roll ID → Storage → Issue request → Batch"],
    equipment:["Weighing scale","Racks / bins","Barcode / tag printer","Trolley"],
    params:["Roll no.","Lot no.","Fabric type & composition","Weight, width, qty","Order ref","Location","Status"],
    problems:["Wrong roll issued","Shade-group mixing","Record mismatch"] },
  { id:"batch", name:"Batch Section", short:"Batch", cat:"production", icon:"📋",
    pos:{x:430,y:192,w:220,h:88},
    beginner:"Selects the right grey rolls and prepares them as one dyeable batch with a batch card.",
    pro:"Batch planning + formation: grey + order + recipe info → batch card, machine allocation, process route. Batch Card is the control document.",
    inputs:["Grey fabric (material)","Order requirement","Recipe / lab info (Chem Lab)","Fabric specification"],
    outputs:["Prepared batch + Batch Card","Machine allocation → Dyeing"],
    responsibilities:["Batch planning","Fabric selection","Batch formation & card","Machine allocation"],
    processes:["Planning → Selection → Formation → Card → Allocation → Send to dyeing"],
    equipment:["Batch trolley","Weighing scale","Sewing / tacking m/c","Card / label printer"],
    params:["Batch no.","Order no.","Weight/qty","Colour","Machine","Recipe ref","Route","Priority","Date"],
    problems:["Wrong shade grouping","Weight mismatch","Missing recipe ref on card"] },
  { id:"dyeing", name:"Dyeing Section", short:"Dyeing", cat:"production", icon:"🎨",
    pos:{x:405,y:314,w:270,h:104}, central:true,
    beginner:"The heart of the unit — fabric is dyed to the required colour following the recipe.",
    pro:"Central production: pre-treatment → dye addition → temperature/time/pH control → washing/soaping → unload. Routes configurable by fibre, dye class, machine, shade, SOP.",
    inputs:["Prepared batch + card","Recipe / dyes / chemicals","Water, steam, electricity","Machine"],
    outputs:["Dyed fabric → Finishing","Process records","Samples"],
    responsibilities:["Machine loading","Chemical & dye dosing","Curve control (T, pH, time)","Wash-off & completion"],
    processes:["Receive → Allocate → Load → Pre-treat → Dose → Control T/pH/t → Dye → Rinse/soap → Unload"],
    equipment:["Jet / winch / jigger / beam dyeing m/c","Dosing tanks","pH / T controllers","Hydro extractor"],
    params:["Dye %","Chemical g/L","Liquor ratio","pH","Temperature curve","Time","Washing steps"],
    problems:["Unlevel dyeing","Shade variation","Crease marks","pH drift"] },
  { id:"finishing", name:"Finishing Section", short:"Finishing", cat:"production", icon:"🧺",
    pos:{x:430,y:452,w:220,h:88},
    beginner:"Gives dyed fabric its final width, softness, look and feel.",
    pro:"Physical/appearance control: dewatering → drying → stenter (width/GSM) → chemical finish → compacting. Blocks optional per article (softening, heat-set, brushing, calendaring…).",
    inputs:["Dyed fabric","Finishing recipe","Utilities"],
    outputs:["Finished fabric → Quality","Finishing records"],
    responsibilities:["Drying & width control","GSM adjustment","Chemical finish","Final appearance"],
    processes:["Dewater → Dry → Stenter → Finish → Compact → Deliver"],
    equipment:["Hydro extractor","Dryer","Stenter","Compactor","Brushing / calendaring units (optional)"],
    params:["Width","GSM","Temperature","Speed","Overfeed","Moisture","Chemical dosage","Shrinkage","Hand-feel"],
    problems:["Width off-spec","GSM variation","Wavy / skewed fabric","Harsh hand-feel"] },
  { id:"quality", name:"Quality Section", short:"Quality", cat:"quality", icon:"✅",
    pos:{x:430,y:574,w:220,h:90}, decision:true,
    beginner:"The decision gate — PASS fabric goes to garments, FAIL fabric loops back for correction.",
    pro:"Inspection + testing + shade check + spec comparison → PASS (approve/pack/dispatch) or FAIL (root cause → corrective action → reprocess → re-inspect). Feedback loops are first-class flows.",
    inputs:["Finished fabric","Specs & standards","Test methods"],
    outputs:["PASS → Garments","FAIL → corrective-action loop"],
    responsibilities:["Inspection & testing","Shade / GSM / appearance check","Pass/fail decision","Feedback & corrective action"],
    processes:["Inspect → Test → Shade check → Compare → PASS / FAIL → Approve or Loop back"],
    equipment:["Light box (shade)","GSM cutter & scale","Width frame","Pilling / fastness testers","4-point inspection table"],
    params:["Shade Δ","GSM","Width","Shrinkage","Fastness","Defects / 4-point score"],
    problems:["Shade fail","GSM fail","Stains / holes","Missed feedback"] },
  { id:"garments", name:"Garments", short:"Garments", cat:"downstream", icon:"👕",
    pos:{x:430,y:700,w:220,h:66},
    beginner:"Approved finished fabric leaves the dyeing unit to garment making.",
    pro:"Downstream customer of the dyeing unit: receives approved fabric with quality reports, specs and packing list.",
    inputs:["Approved fabric","Quality report","Packing list"],
    outputs:["Cutting / garment production"],
    responsibilities:["Receive approved fabric","Verify spec & shade continuity"],
    processes:["Receive → Verify → Cut → Sew"],
    equipment:["— (outside dyeing unit)"],
    params:["Shade continuity","Roll-wise GSM","Width","Length"],
    problems:["Shade banding in bulk","Short / damaged rolls"] },
  { id:"chemical-lab", name:"Chemical Lab", short:"Chemical Lab", cat:"laboratory", icon:"⚗️",
    pos:{x:60,y:192,w:230,h:96},
    beginner:"Develops the recipe needed to achieve the required colour.",
    pro:"Shade requirement → lab dip → dye/chemical selection → recipe (dye %, dosage, pH, T, t, liquor ratio) → trial → shade matching → correction → approval → final recipe to Batch/Dyeing/Quality.",
    inputs:["Shade / colour requirement","Swatch / standard","Dyes & auxiliaries"],
    outputs:["Lab dip","Approved recipe + parameters","Corrections"],
    responsibilities:["Lab dip & shade matching","Dye & chemical selection","Recipe development & correction"],
    processes:["Requirement → Dip → Selection → Recipe → Trial → Match → Correct → Approve"],
    equipment:["Lab dyeing m/c","Spectrophotometer","pH meter","Precision balance","Glassware"],
    params:["Lab dip","Recipe","Dye %","Chemical dosage","pH","Temperature","Time","Liquor (M:L) ratio","Dye class","Auxiliaries"],
    problems:["Lab-to-bulk mismatch","Poor levelling choice","Unstable pH recipe"] },
  { id:"physical-lab", name:"Physical Lab", short:"Physical Lab", cat:"laboratory", icon:"🔬",
    pos:{x:820,y:492,w:230,h:96},
    beginner:"Tests the fabric's physical properties — weight, strength, shrinkage.",
    pro:"Sample → prep → testing → result → spec comparison → PASS/FAIL → report. Test menu configurable per factory (GSM, width, shrinkage, tensile/tear/burst, pilling, spirality, dimensional stability, fastness…).",
    inputs:["Fabric samples","Test specs"],
    outputs:["Test results & reports → Quality / Finishing"],
    responsibilities:["Sample prep","Physical testing","Spec comparison","Reporting"],
    processes:["Sample → Prep → Test → Compare → PASS/FAIL → Report"],
    equipment:["GSM cutter","Tensile/tear tester","Burst tester","Pilling box","Shrinkage template & oven"],
    params:["GSM","Width","Shrinkage %","Tensile / tear / burst","Pilling grade","Spirality"],
    problems:["Sampling bias","Conditioning errors","Method drift"] },
  { id:"maintenance", name:"Maintenance", short:"Maintenance", cat:"engineering", icon:"🔧",
    pos:{x:60,y:492,w:230,h:96},
    beginner:"Keeps production machines running — fixes breakdowns, does preventive care.",
    pro:"Machine-focused: preventive (schedule → inspect → maintain → test → release) + breakdown (failure → request → troubleshoot → repair → test → release). Serves Batch, Dyeing, Finishing, lab equipment.",
    inputs:["Machine problem / request (from production)"],
    outputs:["Machine repaired / released (to production)"],
    responsibilities:["Preventive maintenance","Breakdown repair","Machine availability","Troubleshooting"],
    processes:["Schedule → Inspect → Maintain → Test → Available  /  Failure → Request → Repair → Test → Release"],
    equipment:["Tool room","Spares store","Multimeter","Vibration / thermal tools"],
    params:["Downtime","MTBF / MTTR","PM compliance","Breakdown log"],
    problems:["Repeat failures","No spares","Delayed release"] },
  { id:"central-eng", name:"Central Engineering", short:"Central Eng.", cat:"engineering", icon:"🏭",
    pos:{x:810,y:82,w:260,h:96},
    beginner:"Supplies power, steam, water and air — the factory's lifeline.",
    pro:"Utility/infrastructure-focused: electricity, steam, water, compressed air, cooling/chilled water, boilers, HVAC, pumps, energy systems. Configurable per site. Shown as support flow, not material flow.",
    inputs:["Utility demand from production"],
    outputs:["Steam / water / power / air → Dyeing, Finishing, unit"],
    responsibilities:["Utility generation & distribution","Energy & infrastructure","Utility restoration"],
    processes:["Engineering → Utilities → Production departments"],
    equipment:["Boiler","Compressor","Pumps","Chiller","Electrical panels","ETP interface"],
    params:["Steam pressure","Water flow","Power load","Air pressure"],
    problems:["Steam pressure drop","Power trip","Water shortage"] }
];

/* Connection: { from, to, type: material|info|support|feedback, label, what[], why, next } */
const CONNECTIONS = [
  { from:"grey-fabric", to:"grey-store", type:"material", label:"Grey arrival",
    what:["Grey fabric lots","Roll / lot identity","Supplier papers"], why:"Feed traceable grey stock into the unit.", next:"Store receives, identifies and stocks the lot." },
  { from:"grey-store", to:"batch", type:"material", label:"Fabric + lot info",
    what:["Fabric rolls","Roll no. / lot no.","Quantity / weight","Order reference"], why:"Give Batch the exact physical stock to plan from.", next:"Batch plans and forms the dye lot." },
  { from:"batch", to:"dyeing", type:"material", label:"Batch + card",
    what:["Prepared batch","Batch no. & batch card","Fabric info","Machine allocation","Recipe reference"], why:"Hand a fully-defined, traceable batch to the machine.", next:"Dyeing loads and executes the recipe." },
  { from:"dyeing", to:"finishing", type:"material", label:"Dyed fabric",
    what:["Dyed fabric","Batch information","Process status"], why:"Move dyed goods to physical/appearance control.", next:"Finishing dries, sets width/GSM and finishes." },
  { from:"finishing", to:"quality", type:"material", label:"Finished fabric",
    what:["Finished fabric","Sample","Finishing information"], why:"Present finished goods for the pass/fail decision.", next:"Quality inspects, tests and decides." },
  { from:"quality", to:"garments", type:"material", label:"Approved fabric",
    what:["Approved fabric","Packing / dispatch"], why:"Only PASS fabric leaves the unit.", next:"Garments receives and cuts." },

  { from:"chemical-lab", to:"batch", type:"info", label:"Recipe draft",
    what:["Lab dip reference","Dye selection (draft)","Target shade"], why:"So Batch plans against a technically valid recipe.", next:"Batch attaches recipe ref to the batch card." },
  { from:"chemical-lab", to:"dyeing", type:"info", label:"Recipe + params",
    what:["Final recipe","Dye % / chemical dosage","pH · temperature · time","Liquor ratio","Special instructions"], why:"To execute the approved dyeing process exactly.", next:"Dyeing doses and runs the curve." },
  { from:"chemical-lab", to:"quality", type:"info", label:"Shade std.",
    what:["Standard swatch","Shade tolerance","Recipe ref"], why:"So Quality judges against the same standard.", next:"Quality compares bulk vs standard." },
  { from:"physical-lab", to:"quality", type:"info", label:"Test report",
    what:["GSM / width results","Shrinkage, strength","PASS / FAIL vs spec"], why:"Evidence for the quality decision.", next:"Quality records the decision." },
  { from:"physical-lab", to:"finishing", type:"info", label:"GSM spec",
    what:["Target GSM / width","Correction guidance"], why:"So Finishing adjusts machine parameters correctly.", next:"Finishing re-sets stenter/compactor." },
  { from:"quality", to:"garments", type:"info", label:"Approval + spec",
    what:["Approval","Test reports","Specification sheet"], why:"Downstream needs proof of conformance.", next:"Garments accepts the delivery." },

  { from:"maintenance", to:"batch", type:"support", label:"M/C upkeep",
    what:["Preventive checks","Repair & release"], why:"Batch equipment must be available.", next:"Batch resumes planning." },
  { from:"maintenance", to:"dyeing", type:"support", label:"Repair / release",
    what:["Troubleshooting","Repair","Testing","Machine released"], why:"Dyeing machines are the bottleneck — downtime stops dyeing.", next:"Production resumes on released machine." },
  { from:"maintenance", to:"finishing", type:"support", label:"M/C upkeep",
    what:["Stenter / dryer maintenance","Release note"], why:"Finishing quality depends on machine condition.", next:"Finishing resumes." },
  { from:"maintenance", to:"physical-lab", type:"support", label:"Lab equip.",
    what:["Calibration support","Lab equipment repair"], why:"Test results are only valid on healthy instruments.", next:"Lab resumes testing." },
  { from:"central-eng", to:"dyeing", type:"support", label:"Steam·water·power",
    what:["Steam","Water","Electricity","Utility availability"], why:"Dyeing cannot run its temperature curve without utilities.", next:"Dyeing runs / resumes." },
  { from:"central-eng", to:"finishing", type:"support", label:"Utilities",
    what:["Electricity","Steam / hot air","Compressed air"], why:"Dryers and stenters are utility-heavy.", next:"Finishing runs / resumes." },
  { from:"central-eng", to:"chemical-lab", type:"support", label:"Lab utilities",
    what:["Water","Power","Conditioned environment"], why:"Lab trials need stable services.", next:"Lab continues recipe work." },

  { from:"quality", to:"dyeing", type:"feedback", label:"Reprocess req.",
    what:["Quality result","Failure info (shade)…","Corrective-action requirement"], why:"Shade failures must loop back to dyeing via corrected recipe.", next:"Dyeing reprocesses after correction." },
  { from:"quality", to:"finishing", type:"feedback", label:"Adjust req.",
    what:["GSM / width failure","Appearance notes"], why:"Physical failures loop to finishing parameter adjustment.", next:"Finishing adjusts and reprocesses." },
  { from:"quality", to:"chemical-lab", type:"feedback", label:"Recipe correction",
    what:["Shade deviation data","Re-match request"], why:"Recipe owner must correct the formulation.", next:"Chem lab issues corrected recipe." }
];

const WORKFLOWS = {
  "grey-store": { title:"Grey Fabric Store — traceability workflow",
    steps:[["Grey fabric arrival","Trucks / lots arrive with supplier papers"],["Receiving","Count rolls, verify vs order"],["Identification","Tag roll no. + lot no."],["Inspection / verification","Visual check, stains, width"],["Weight / quantity recording","Scale + register"],["Roll / lot identification","Unique IDs, location assigned"],["Storage","Racked, status = stored"],["Issue request","Batch requests stock"],["Issue to Batch","Status = issued, papers attached"]],
    meta:"Traceability chain: Order → Grey lot → Roll no. → Store → Batch no. → Machine → Finishing → Quality → Garments." },
  "chemical-lab": { title:"Chemical Lab — recipe workflow",
    steps:[["Shade / colour requirement","Standard swatch + tolerance"],["Lab dip","Small-scale dye trial"],["Dye selection","Dye class per fibre"],["Chemical selection","Auxiliaries: levelling, sequestering…"],["Recipe development","Dye %, g/L, pH, T, t, liquor ratio"],["Lab trial","Run + evaluate"],["Shade matching","Spectro + light box"],["Correction","Adjust → re-dip if needed"],["Approval","Sign-off"],["Final recipe","Released to Batch / Dyeing / Quality"]],
    meta:"Clicking Chemical Lab → Dyeing shows: Recipe / Dye selection / Chemical dosage / Process parameters." },
  "physical-lab": { title:"Physical Lab — testing workflow",
    steps:[["Sample","Cut per method"],["Sample preparation","Conditioning"],["Testing","GSM, width, shrinkage, strength, pilling…"],["Result","Measured values"],["Specification comparison","Compare vs customer spec"],["PASS / FAIL","Decision"],["Report","Issued to Quality / Finishing"]],
    meta:"Test menu is configurable — not every factory runs every test here." },
  "batch": { title:"Batch Section — preparation workflow",
    steps:[["Collect inputs","Grey + order + recipe + spec"],["Batch planning","Group rolls by shade/weight"],["Fabric selection","Pick rolls, FIFO"],["Batch formation","Join into dyeable lot"],["Batch card","Batch no., order, fabric, colour, machine, recipe ref, route, priority, date"],["Machine allocation","Assign dyeing machine"],["Send to dyeing","Batch + card travel together"]],
    meta:"Batch Card is the control document. Grey Store → Batch = MATERIAL · Chem Lab → Batch = INFORMATION." },
  "dyeing": { title:"Dyeing Section — production workflow",
    steps:[["Batch received","Verify card + fabric"],["Machine allocation","Confirm dyeing m/c"],["Machine loading","Load fabric, check liquor"],["Pre-treatment","Scour/bleach where applicable"],["Chemical addition","Auxiliaries dosed"],["Dye addition","Dyes dosed per recipe"],["Temperature control","Follow the curve"],["Time control","Hold per recipe"],["pH control","Monitor + adjust"],["Dyeing","Fixation"],["Washing / rinsing","Remove unfixed dye"],["Neutralisation / soaping","Where applicable"],["Completion","Drop bath, sample"],["Unloading","To finishing"]],
    meta:"Routes configurable by fibre / dye class / machine / shade / SOP. Examples: cotton-reactive, polyester-disperse, nylon, blends (add later)." },
  "finishing": { title:"Finishing Section — appearance workflow",
    steps:[["Dyed fabric in","Verify batch info"],["Dewatering","Hydro extraction (where applicable)"],["Drying","Remove moisture"],["Stenter","Set width, dry, heat-set"],["Width / GSM adjustment","Overfeed, speed, temp"],["Chemical finish","Softener / functional (optional)"],["Compacting","Control shrinkage"],["Final appearance","Check hand-feel + look"],["To quality","Deliver with records"]],
    meta:"Optional blocks: softening, heat-setting, brushing, raising, calendaring, compacting, functional finishing." },
  "quality": { title:"Quality Section — decision gateway",
    steps:[["Finished fabric in","Register lot"],["Inspection","4-point / visual"],["Testing","With Physical Lab"],["Shade check","Light box vs standard"],["GSM / width / appearance","Measure"],["Specification comparison","Compare all results"],["PASS / FAIL","◆ Decision"],["If PASS","Approve → pack / dispatch → garments"],["If FAIL","Identify problem → root cause → owner → corrective action → reprocess → re-inspect"]],
    meta:"Quality is a gateway, not just the last step. The red feedback arrows make the loop visible." },
  "maintenance": { title:"Maintenance — two workflows",
    steps:[["Preventive: schedule","Calendar / running hours"],["Inspect","Checklist"],["Maintain","Service + parts"],["Test","Trial run"],["Machine available","Release to production"],["— Breakdown path —","Failure reported"],["Maintenance request","Production → Maintenance"],["Troubleshoot","Diagnose"],["Repair","Fix + spares"],["Test & release","Machine released, production resumes"]],
    meta:"Production → Maintenance: 'Machine problem'. Maintenance → Production: 'Machine repaired / released'." },
  "central-eng": { title:"Central Engineering — utilities workflow",
    steps:[["Demand","Production utility need"],["Generation","Boiler / compressor / pumps"],["Distribution","Steam, water, power, air networks"],["Monitor","Pressure, flow, load"],["Restore","On failure: isolate → fix → restore"],["Support production","Resume signal"]],
    meta:"Utility/infrastructure focus — electricity, steam, water, compressed air, cooling, HVAC, pumps, energy. Configurable per site." }
};

const BATCHES = {
  "B-501": { order:"ORD-001", fabric:"Cotton single jersey 180 GSM", colour:"Reactive navy", machine:"D-08 (jet)", recipe:"REC-105",
    stages:[
      { dept:"grey-store", title:"Grey Store", status:"Done", info:"Lot GL-101 · Rolls R-201…R-208 · 512 kg · Location A-12", date:"Day 1 · 09:20" },
      { dept:"batch", title:"Batch B-501 formed", status:"Done", info:"8 rolls grouped · Batch card issued · Machine D-08 allocated · REC-105 attached", date:"Day 1 · 14:05" },
      { dept:"chemical-lab", title:"Recipe approved", status:"Done", info:"REC-105 · 4.2% dye · pH 11 · 60 °C × 60 min · M:L 1:8", date:"Day 1 · 11:40" },
      { dept:"dyeing", title:"Dyeing complete", status:"Done", info:"Curve followed · Wash-off OK · Sample → finishing", date:"Day 2 · 16:30" },
      { dept:"finishing", title:"Finishing complete", status:"Done", info:"Stenter ST-03 · 180 GSM · 72 inch · Soft finish", date:"Day 3 · 10:15" },
      { dept:"physical-lab", title:"Tests passed", status:"Done", info:"GSM 181 · Shrinkage −3.1% · Pilling 4", date:"Day 3 · 13:00" },
      { dept:"quality", title:"PASS → Garments", status:"Approved", info:"Shade OK · Q-900 · Dispatched to garments", date:"Day 3 · 15:45" }
    ],
    trace:[["Order","ORD-001"],["Grey lot","GL-101"],["Roll","R-201…R-208"],["Batch","B-501"],["Dyeing m/c","D-08"],["Recipe","REC-105"],["Finishing m/c","ST-03"],["Quality report","Q-900"],["Status","APPROVED"]] },
  "B-502": { order:"ORD-002", fabric:"Poly interlock 200 GSM", colour:"Disperse red", machine:"D-11 (jet)", recipe:"REC-210",
    stages:[
      { dept:"grey-store", title:"Grey Store", status:"Done", info:"Lot GL-114 · 6 rolls · 430 kg", date:"Day 1 · 10:00" },
      { dept:"batch", title:"Batch B-502 formed", status:"Done", info:"Card issued · D-11 allocated · REC-210 attached", date:"Day 1 · 15:20" },
      { dept:"chemical-lab", title:"Recipe approved", status:"Done", info:"REC-210 · 2.8% disperse · pH 4.5 · 130 °C × 45 min", date:"Day 1 · 12:10" },
      { dept:"dyeing", title:"Dyeing complete", status:"Done", info:"High-temp curve OK", date:"Day 2 · 18:00" },
      { dept:"finishing", title:"Heat-set + finish", status:"In progress", info:"ST-02 · width setting running", date:"Day 3 · now" },
      { dept:"quality", title:"Pending", status:"Waiting", info:"Inspection queued after finishing", date:"—" }
    ],
    trace:[["Order","ORD-002"],["Grey lot","GL-114"],["Roll","R-310…R-315"],["Batch","B-502"],["Dyeing m/c","D-11"],["Recipe","REC-210"],["Finishing m/c","ST-02"],["Quality report","pending"],["Status","IN PROGRESS"]] },
  "B-503": { order:"ORD-003", fabric:"CVC fleece 280 GSM", colour:"Rework — dark shade", machine:"D-08 (jet)", recipe:"REC-105-R2",
    stages:[
      { dept:"grey-store", title:"Grey Store", status:"Done", info:"Lot GL-101 (balance rolls)", date:"Day 2 · 09:00" },
      { dept:"batch", title:"Batch B-503 formed", status:"Done", info:"Rework batch linked to B-501 shade deviation", date:"Day 2 · 11:00" },
      { dept:"quality", title:"First FAIL", status:"Failed", info:"Shade too light · Δ vs standard · feedback → Chem Lab + Dyeing", date:"Day 3 · 09:30" },
      { dept:"chemical-lab", title:"Correction issued", status:"Done", info:"REC-105-R2 · +0.4% navy · levelling agent added", date:"Day 3 · 12:00" },
      { dept:"dyeing", title:"Reprocess", status:"In progress", info:"Topping on D-08 per corrected recipe", date:"Day 3 · now" },
      { dept:"quality", title:"Re-inspection", status:"Waiting", info:"Queued after re-dye + finish", date:"—" }
    ],
    trace:[["Order","ORD-003"],["Grey lot","GL-101"],["Roll","R-209…R-212"],["Batch","B-503"],["Dyeing m/c","D-08"],["Recipe","REC-105-R2 (corrected)"],["Finishing m/c","ST-03"],["Quality report","Q-901 (FAIL → loop)"],["Status","REWORK"]] }
};

const TROUBLES = {
  shade: { title:"🎨 Shade failure", steps:[["Quality: shade FAIL","Light-box check vs standard"],["Check dyeing","Curve, dosing order, pH/T/t logs"],["Check recipe","Dye %, auxiliaries, liquor ratio"],["Check Chemical Lab","Lab dip vs bulk, water, correction"],["Correction","Revised recipe issued"],["Dyeing: reprocess","Top / strip per instruction"],["Quality: re-inspect","PASS → release, else loop again"]] },
  gsm: { title:"📏 GSM failure", steps:[["Quality: GSM FAIL","Off-spec weight"],["Finishing","Review stenter/compactor params"],["Adjust","Overfeed, speed, temperature, chemistry"],["Reprocess","Re-run finishing"],["Quality: re-inspect","PASS → release"]] },
  breakdown: { title:"🔧 Machine breakdown", steps:[["Dyeing: machine problem","Stop + isolate"],["Maintenance request","Production → Maintenance"],["Troubleshoot","Diagnose cause"],["Repair","Fix + spares"],["Testing","Trial run"],["Machine released","Maintenance → Production"],["Dyeing resumes","Batch continues"]] },
  utility: { title:"⚡ Utility failure", steps:[["Production: utility problem","Steam / power / water drop"],["Central Engineering","Isolate + diagnose"],["Restore utility","Boiler / power / pumps"],["Verify","Pressure / flow back in range"],["Production resumes","Restart per SOP"]] }
};

const GLOSSARY = [
  ["GSM","Weight of fabric per square metre.","Grams per Square Metre — areal density measured with cutter + scale.","Finishing sets it, Physical Lab tests it, Quality judges it.","Finishing · Physical Lab · Quality"],
  ["M:L Ratio","How much water per kg of fabric.","Material-to-liquor ratio, e.g. 1:8 = 8 L water per 1 kg fabric.","Recipe + dyeing machine setting.","Chemical Lab · Dyeing"],
  ["Liquor Ratio","Same idea as M:L — bath concentration basis.","Total bath volume relative to goods; drives dye/chemical dosing.","Dyeing calculations.","Chemical Lab · Dyeing"],
  ["Lab Dip","A small trial dyeing of the required colour.","Lab-scale dyeing used for shade approval before bulk.","Must approve before bulk recipe release.","Chemical Lab · Quality"],
  ["Recipe","The approved 'formula' for a colour.","Dye %, chemicals g/L, pH, temperature, time, liquor ratio, route.","Travels Chem Lab → Batch → Dyeing.","Chemical Lab · Batch · Dyeing"],
  ["Reactive Dye","Dye for cotton that bonds with the fibre.","Covalent-bond dye for cellulosics; needs alkali + salt, wash-off critical.","Cotton dyeing route.","Chemical Lab · Dyeing"],
  ["Disperse Dye","Dye for polyester.","Non-ionic dye applied at high temperature (~130 °C), pH ~4.5.","Polyester route.","Chemical Lab · Dyeing"],
  ["pH","How acidic or alkaline the bath is.","Log-scale 0–14; controls fixation (reactive ~11, disperse ~4.5).","Monitored through the dye curve.","Chemical Lab · Dyeing"],
  ["Fastness","Does the colour stay?","Resistance to washing, rubbing, light, perspiration — graded 1–5.","Tested/reported at Quality.","Physical Lab · Quality · Garments"],
  ["Stenter","Machine that sets width and dries fabric.","Hot-air chambers + clips/chains; controls width, GSM, bow/skew.","Core finishing machine.","Finishing · Maintenance"],
  ["Compactor","Machine that controls shrinkage.","Mechanical compressive shrinkage (tubular/open-width).","After stentering.","Finishing · Quality"],
  ["Overfeed","Feeding extra fabric into a machine.","% overfeed adds GSM/fullness, relaxes shrinkage.","Stenter parameter.","Finishing"],
  ["Shrinkage","How much fabric shrinks after wash.","% length/width change per wash test (e.g. −3%).","Spec + test + finishing control.","Finishing · Physical Lab · Quality"],
  ["Softener","Chemical for soft hand-feel.","Cationic/silicone finish applied in finishing.","Finishing recipe.","Finishing · Chemical Lab"],
  ["Sequestering Agent","Water-treatment helper.","Chelates Ca/Mg/Fe so dyes level and fix evenly.","Added in pre-treatment/dyeing.","Chemical Lab · Dyeing"],
  ["Leveling Agent","Helps dye go on evenly.","Retards/migrates dye to prevent unlevelness.","Critical for deep shades.","Chemical Lab · Dyeing"],
  ["Batch Card","The batch's ID document.","Batch no., order, fabric, colour, machine, recipe ref, route, priority.","Travels Batch → Dyeing → Finishing.","Batch · Dyeing"],
  ["Shade","The exact colour.","Bulk colour vs approved standard under standard light.","Matched in lab, judged in quality.","Chemical Lab · Dyeing · Quality"],
  ["Machine Breakdown","Unplanned machine stop.","Failure → request → repair → test → release workflow.","Support flow event.","Production · Maintenance"],
  ["Preventive Maintenance","Servicing before failure.","Scheduled inspection/service to keep machines available.","Calendar/hour-based.","Maintenance"],
  ["Steam","Heat energy carrier.","Pressurised steam for heating dye/finishing machines.","Utility from Central Eng.","Central Eng. · Dyeing · Finishing"],
  ["Compressed Air","Pneumatic utility.","Drives valves, actuators, blow-down, instruments.","Plant-wide utility.","Central Eng. · Production"]
];

/* ============================== STATE ============================== */
const state = { mode:"beginner", zoom:1, batch:"B-501", batchIdx:0, traceIdx:8, trouble:"shade", wf:"dyeing", cat:"all" };
const $ = s => document.querySelector(s);
const deptById = id => DEPARTMENTS.find(d=>d.id===id);
const catColor = c => (CATEGORY_META[c]||CATEGORY_META.production).color;

/* ============================== MAP ============================== */
function nodeCenter(d){ const p=d.pos; return {x:p.x+p.w/2, y:p.y+p.h/2}; }

function edgePath(a,b){
  const A=nodeCenter(deptById(a)), B=nodeCenter(deptById(b));
  const dx=B.x-A.x, dy=B.y-A.y;
  // start/end at node borders
  const pa=deptById(a).pos, pb=deptById(b).pos;
  let x1=A.x, y1=A.y, x2=B.x, y2=B.y;
  if(Math.abs(dx)>Math.abs(dy)){ x1=A.x+Math.sign(dx)*pa.w/2; y1=A.y+dy*0.15; x2=B.x-Math.sign(dx)*pb.w/2; y2=B.y-dy*0.1; }
  else { y1=A.y+Math.sign(dy)*pa.h/2; x1=A.x+dx*0.1; y2=B.y-Math.sign(dy)*pb.h/2; x2=B.x-dx*0.1; }
  const mx=(x1+x2)/2, my=(y1+y2)/2;
  const curve = Math.abs(dx)>Math.abs(dy) ? `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}` : `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`;
  return { d:curve, lx:mx, ly:my };
}

const FLOW_STYLE = {
  material:{ w:4.5, dash:"", marker:"arrMat", color:"#ea580c" },
  info:{ w:2.2, dash:"7 5", marker:"arrInfo", color:"#60a5fa" },
  support:{ w:2.6, dash:"2 4", marker:"arrSup", color:"#2dd4bf" },
  feedback:{ w:2.4, dash:"8 5", marker:"arrFb", color:"#f87171" }
};

function renderMap(){
  const NS="http://www.w3.org/2000/svg";
  const layers={ material:$("#layerMaterial"), info:$("#layerInfo"), support:$("#layerSupport"), feedback:$("#layerFeedback") };
  Object.values(layers).forEach(g=>g.innerHTML="");
  const vis={ material:$("#tMat").checked, info:$("#tInfo").checked, support:$("#tSup").checked, feedback:$("#tFb").checked };
  CONNECTIONS.forEach((c,i)=>{
    const s=FLOW_STYLE[c.type];
    const {d,lx,ly}=edgePath(c.from,c.to);
    const g=document.createElementNS(NS,"g");
    g.setAttribute("class","flow-edge"); g.dataset.idx=i;
    g.style.display=vis[c.type]?"":"none";
    g.innerHTML=`<path d="${d}" stroke="${s.color}" stroke-width="${s.w+6}" opacity="0" />
      <path d="${d}" stroke="${s.color}" stroke-width="${s.w}" ${s.dash?`stroke-dasharray="${s.dash}"`:""} marker-end="url(#${s.marker})" opacity="0.95">
        ${c.type!=="material"?'<animate attributeName="stroke-dashoffset" from="24" to="0" dur="1.2s" repeatCount="indefinite"/>':""}
      </path>
      <text x="${lx}" y="${ly-6}" text-anchor="middle" class="edge-label-bg">${c.label}</text>`;
    g.addEventListener("click",ev=>{ev.stopPropagation();openConnection(i);});
    layers[c.type].appendChild(g);
  });
  // nodes
  const ng=$("#layerNodes"); ng.innerHTML="";
  DEPARTMENTS.forEach(d=>{
    const {x,y,w,h}=d.pos; const col=catColor(d.cat);
    const g=document.createElementNS(NS,"g");
    g.setAttribute("class","dept-node"); g.dataset.id=d.id;
    g.setAttribute("tabindex","0"); g.setAttribute("role","button");
    g.setAttribute("aria-label",d.name+" — open details");
    const stroke=d.central?"#fdba74":d.decision?"#f87171":"#334155";
    g.innerHTML=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="13" fill="#0f172a" stroke="${stroke}" stroke-width="2"/>
      <rect x="${x}" y="${y}" width="${w}" height="9" rx="4" fill="${col}"/>
      <text x="${x+14}" y="${y+32}" font-size="22">${d.icon}</text>
      <text x="${x+44}" y="${y+30}" font-size="14.5" font-weight="800" fill="#f8fafc">${d.short}</text>
      <text x="${x+44}" y="${y+47}" font-size="10.5" fill="#94a3b8">${(CATEGORY_META[d.cat]||{}).label||""}${d.central?" · ★ CORE":""}${d.decision?" · ◆ GATE":""}</text>
      <text x="${x+14}" y="${y+h-10}" font-size="10.5" fill="#cbd5e1">${d.params.slice(0,3).join(" · ").slice(0,38)}</text>`;
    g.addEventListener("click",ev=>{ev.stopPropagation();openDepartment(d.id);});
    g.addEventListener("keydown",ev=>{if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();openDepartment(d.id);}});
    ng.appendChild(g);
  });
  applyZoom();
}
function applyZoom(){ $("#viewport").setAttribute("transform",`translate(600 415) scale(${state.zoom}) translate(-600 -415)`); }

/* ============================== DRAWER ============================== */
function openDrawer(html){ $("#drawerContent").innerHTML=html; $("#drawer").hidden=false; $("#drawerOverlay").hidden=false; $("#drawerClose").focus(); }
function closeDrawer(){ $("#drawer").hidden=true; $("#drawerOverlay").hidden=true; }

function openDepartment(id){
  const d=deptById(id); if(!d) return;
  const desc = state.mode==="beginner"?d.beginner:d.pro;
  const conns=CONNECTIONS.filter(c=>c.from===id||c.to===id);
  const li=a=>a.map(x=>`<li>${x}</li>`).join("");
  openDrawer(`
    <span class="tag" style="background:${catColor(d.cat)}">${CATEGORY_META[d.cat].label}</span>
    <h2>${d.icon} ${d.name}</h2>
    <p>${desc}</p>
    ${state.mode==="beginner"?`<p class="muted small">Professional detail available — switch to <b>Professional</b> mode (top right).</p>`:`<p class="muted small">Beginner summary: ${d.beginner}</p>`}
    <h4>Inputs → Outputs</h4><ul><li><b>In:</b> ${d.inputs.join("; ")}</li><li><b>Out:</b> ${d.outputs.join("; ")}</li></ul>
    <h4>Main responsibilities</h4><ul>${li(d.responsibilities)}</ul>
    <h4>Key process</h4><p class="muted">${d.processes.join(" · ")}</p>
    <h4>Machines / equipment</h4><ul>${li(d.equipment)}</ul>
    <h4>Key parameters</h4><p>${d.params.map(p=>`<code>${p}</code>`).join(" ")}</p>
    <h4>Common problems</h4><ul>${li(d.problems)}</ul>
    <h4>Connected departments (${conns.length})</h4><ul>
      ${conns.map(c=>{const o=c.from===id?c.to:c.from;const dir=c.from===id?"→":"←";
        return `<li><b>${dir} ${deptById(o).short}</b> <span class="muted">[${c.type}] ${c.label}</span></li>`;}).join("")}
    </ul>`);
}
function openConnection(i){
  const c=CONNECTIONS[i]; const f=deptById(c.from), t=deptById(c.to);
  openDrawer(`
    <span class="tag" style="background:${FLOW_STYLE[c.type].color}">${c.type.toUpperCase()} FLOW</span>
    <h2>${f.short} → ${t.short}</h2>
    <p class="muted">${c.label}</p>
    <h4>What is transferred?</h4><ul>${c.what.map(x=>`<li>${x}</li>`).join("")}</ul>
    <h4>Why?</h4><p>${c.why}</p>
    <h4>Next step</h4><p>${c.next}</p>
    <p><button class="btn small" onclick="document.querySelector('#drawerClose').click()">Close</button>
    <button class="btn small" data-goto-dept="${t.id}">Open ${t.short} →</button></p>`);
  document.querySelector("[data-goto-dept]")?.addEventListener("click",e=>openDepartment(e.target.dataset.gotoDept));
}

/* ============================== DEPARTMENTS GRID ============================== */
function renderDeptGrid(){
  const grid=$("#deptGrid"); grid.innerHTML="";
  DEPARTMENTS.filter(d=>state.cat==="all"||d.cat===state.cat||(state.cat==="production"&&d.cat==="entry")).forEach(d=>{
    const b=document.createElement("button");
    b.className="dept-card"; b.dataset.cat=d.cat;
    b.innerHTML=`<span class="cat ${d.cat==="laboratory"?"lab":d.cat==="quality"?"quality":d.cat==="engineering"?"eng":d.cat==="downstream"?"downstream":"production"}">${CATEGORY_META[d.cat].label}</span>
      <h3>${d.icon} ${d.name}</h3><p>${state.mode==="beginner"?d.beginner:d.pro}</p>
      <div class="meta muted">▤ ${d.outputs[0]}<br>⚙ ${d.equipment[0]}</div>`;
    b.addEventListener("click",()=>openDepartment(d.id));
    grid.appendChild(b);
  });
}

/* ============================== WORKFLOWS ============================== */
function renderWorkflows(){
  const tabs=$("#wfTabs"); tabs.innerHTML="";
  Object.keys(WORKFLOWS).forEach(k=>{
    const b=document.createElement("button");
    b.textContent=deptById(k).short; b.setAttribute("role","tab");
    b.classList.toggle("active",k===state.wf);
    b.addEventListener("click",()=>{state.wf=k;renderWorkflows();});
    tabs.appendChild(b);
  });
  const wf=WORKFLOWS[state.wf];
  $("#wfSteps").innerHTML=wf.steps.map((s,i)=>`<li data-n="${i+1}" class="${/PASS|FAIL|decision|Decision|—/.test(s[0])?"decision":""}"><div><b>${s[0]}</b><small>${s[1]}</small></div></li>`).join("");
  $("#wfMeta").innerHTML=`<b>Note:</b> ${wf.meta}<br><span class="muted small">Process may vary according to fibre, fabric construction, dye class, machine, customer requirement and factory SOP.</span>`;
}

/* ============================== BATCH + TRACE ============================== */
function renderBatch(){
  const b=BATCHES[state.batch];
  const tl=$("#batchTimeline"); tl.innerHTML="";
  b.stages.forEach((s,i)=>{
    const d=document.createElement("button");
    d.className=`t-step ${i===state.batchIdx?"active":""} ${i<state.batchIdx?"done":""}`;
    d.innerHTML=`<b>${s.title}</b><br><small>${s.status} · ${s.date}</small>`;
    d.addEventListener("click",()=>{state.batchIdx=i;renderBatch();});
    tl.appendChild(d);
  });
  const s=b.stages[state.batchIdx]||b.stages[0];
  const dep=deptById(s.dept);
  $("#batchDetail").innerHTML=`<h3>${s.title} — ${b.fabric}</h3>
    <div class="kv">
      <div><b>Batch</b>${state.batch} · ${b.order}</div>
      <div><b>Department</b>${dep?dep.name:s.dept}</div>
      <div><b>Status</b>${s.status}</div>
      <div><b>Date</b>${s.date}</div>
      <div><b>Machine / recipe</b>${b.machine} · ${b.recipe}</div>
      <div><b>Detail</b>${s.info}</div>
    </div>
    <p class="muted small">Support involved: Chemical Lab (recipe), Maintenance (machine health), Central Engineering (utilities), Physical Lab + Quality (tests & decision).</p>`;
  // trace
  const tc=$("#traceChain"); tc.innerHTML="";
  b.trace.forEach((t,i)=>{
    if(i>0){const a=document.createElement("span");a.className="trace-arrow";a.textContent="↓";tc.appendChild(a);}
    const n=document.createElement("button");
    n.className="trace-node"+(i===state.traceIdx?" active":"");
    n.innerHTML=`${t[0]}<br><b>${t[1]}</b>`;
    n.addEventListener("click",()=>{state.traceIdx=i;renderBatch();});
    tc.appendChild(n);
  });
  const [k,v]=b.trace[state.traceIdx];
  $("#traceDetail").innerHTML=`<b>${k}: ${v}</b> — step ${state.traceIdx+1} of ${b.trace.length}. `+
    (k==="Status"&&/FAIL|REWORK/i.test(v)?`Backward trace: Quality → Dyeing machine → Recipe → Chemical Lab → Grey lot.`:`Move forward / backward to audit traceability.`);
}

/* ============================== TROUBLE ============================== */
function renderTrouble(){
  const tabs=$("#troubleTabs"); tabs.innerHTML="";
  Object.entries(TROUBLES).forEach(([k,v])=>{
    const b=document.createElement("button");
    b.textContent=v.title; b.setAttribute("role","tab");
    b.classList.toggle("active",k===state.trouble);
    b.addEventListener("click",()=>{state.trouble=k;renderTrouble();});
    tabs.appendChild(b);
  });
  $("#troubleSteps").innerHTML=TROUBLES[state.trouble].steps.map((s,i)=>`<li data-n="${i+1}"><div><b>${s[0]}</b><small>${s[1]}</small></div></li>`).join("");
}

/* ============================== CALCULATORS ============================== */
const CALCS=[
  { id:"dye", title:"Dye % → dye weight", desc:"How much dye powder for a lot?",
    inputs:[["Fabric weight (kg)","fabric",500],["Dye shade %","shade",3]],
    formula:"Dye (kg) = fabric × shade% ÷ 100",
    run:v=>{const r=v.fabric*v.shade/100;return `INPUT: ${v.fabric} kg × ${v.shade}%\nFORMULA: ${"Dye = fabric × shade% ÷ 100"}\nCALCULATION: ${v.fabric} × ${v.shade} ÷ 100\nRESULT: ${r.toFixed(2)} kg  (${(r*1000).toFixed(0)} g)`;} },
  { id:"liquor", title:"Liquor quantity (M:L)", desc:"Bath volume from liquor ratio.",
    inputs:[["Fabric weight (kg)","fabric",500],["Liquor ratio (e.g. 8 for 1:8)","lr",8]],
    formula:"Liquor (L) = fabric × ratio",
    run:v=>{const r=v.fabric*v.lr;return `INPUT: ${v.fabric} kg @ 1:${v.lr}\nFORMULA: Liquor = fabric × ratio\nCALCULATION: ${v.fabric} × ${v.lr}\nRESULT: ${r.toFixed(0)} litres`;} },
  { id:"chem", title:"Chemical dosage (g/L)", desc:"Chemical weight from bath concentration.",
    inputs:[["Liquor volume (L)","liq",4000],["Dosage (g/L)","dos",2]],
    formula:"Chemical (g) = liquor × dosage",
    run:v=>{const r=v.liq*v.dos;return `INPUT: ${v.liq} L × ${v.dos} g/L\nFORMULA: Chemical = liquor × dosage\nCALCULATION: ${v.liq} × ${v.dos}\nRESULT: ${r.toFixed(0)} g  (${(r/1000).toFixed(2)} kg)`;} },
  { id:"gsm", title:"GSM from sample", desc:"Fabric areal density.",
    inputs:[["Sample weight (g)","wt",4.5],["Sample area (cm², 100 = cutter)","area",100]],
    formula:"GSM = weight ÷ area × 10,000",
    run:v=>{const r=v.wt/v.area*10000;return `INPUT: ${v.wt} g / ${v.area} cm²\nFORMULA: GSM = weight ÷ area × 10000\nCALCULATION: ${v.wt} ÷ ${v.area} × 10000\nRESULT: ${r.toFixed(1)} GSM`;} },
  { id:"shrink", title:"Shrinkage %", desc:"Dimensional change after wash.",
    inputs:[["Length before (cm)","before",50],["Length after (cm)","after",48.5]],
    formula:"Shrinkage % = (before − after) ÷ before × 100",
    run:v=>{const r=(v.before-v.after)/v.before*100;return `INPUT: ${v.before} → ${v.after} cm\nFORMULA: (before − after) ÷ before × 100\nCALCULATION: (${v.before} − ${v.after}) ÷ ${v.before} × 100\nRESULT: ${r.toFixed(2)} % ${r>0?"(shrinkage)":"(growth)"}`;} }
];
function renderCalcs(){
  const g=$("#calcGrid"); g.innerHTML="";
  CALCS.forEach(c=>{
    const card=document.createElement("div"); card.className="calc-card";
    card.innerHTML=`<h3>🧮 ${c.title}</h3><p class="muted small">${c.desc}<br>Formula: <code>${c.formula}</code></p>`+
      c.inputs.map(([l,k,d])=>`<label>${l}<input type="number" data-calc="${c.id}" data-key="${k}" value="${d}" step="any"></label>`).join("")+
      `<div class="calc-out" id="out-${c.id}"></div>`;
    g.appendChild(card);
  });
  const update=()=>{
    CALCS.forEach(c=>{
      const v={}; cardVals(c,v);
      try{ $("#out-"+c.id).innerHTML="<b>INPUT → FORMULA → CALCULATION → RESULT</b>\n"+c.run(v)+"\n\n<span class='muted'>Educational — follow approved recipes/SOPs in production.</span>"; }
      catch(e){ $("#out-"+c.id).textContent="Check inputs."; }
    });
  };
  const cardVals=(c,v)=>{ document.querySelectorAll(`input[data-calc="${c.id}"]`).forEach(i=>v[i.dataset.key]=parseFloat(i.value)||0); };
  g.addEventListener("input",update); update();
}

/* ============================== GLOSSARY + SEARCH ============================== */
function renderGlossary(filter=""){
  const g=$("#glossGrid"); g.innerHTML="";
  GLOSSARY.filter(([t])=>t.toLowerCase().includes(filter.toLowerCase())).forEach(([t,simple,tech,where,depts])=>{
    const d=document.createElement("div"); d.className="gloss-card";
    d.innerHTML=`<h3>${t}</h3><p><b>Simple:</b> ${simple}</p><p class="tech"><b>Technical:</b> ${tech}</p><div class="use"><b>Where used:</b> ${where}<br><b>Departments:</b> ${depts}</div>`;
    g.appendChild(d);
  });
  if(!g.children.length) g.innerHTML=`<p class="muted">No terms match “${filter}”.</p>`;
}

function buildSearchIndex(){
  const idx=[];
  DEPARTMENTS.forEach(d=>idx.push({t:d.name+" "+d.short,s:`${CATEGORY_META[d.cat].label} department`,fn:()=>openDepartment(d.id)}));
  GLOSSARY.forEach(([t,, ,w])=>idx.push({t,s:"Glossary — "+w,fn:()=>{document.querySelector('#glossary').scrollIntoView({behavior:"smooth"});$("#glossSearch").value=t;renderGlossary(t);}}));
  CONNECTIONS.forEach((c,i)=>idx.push({t:`${deptById(c.from).short} → ${deptById(c.to).short} ${c.label}`,s:`${c.type} flow — ${c.what.slice(0,2).join(", ")}`,fn:()=>openConnection(i)}));
  Object.values(BATCHES).forEach((b,k)=>idx.push({t:`Batch ${k} ${b.fabric}`,s:"Follow-a-batch demo",fn:()=>{state.batch=k;state.batchIdx=0;renderBatch();document.querySelector('#batch').scrollIntoView({behavior:"smooth"});}}));
  return idx;
}
function initSearch(){
  const idx=buildSearchIndex(); const box=$("#globalSearch"), res=$("#searchResults");
  box.addEventListener("input",()=>{
    const q=box.value.trim().toLowerCase();
    if(q.length<2){res.hidden=true;return;}
    const hits=idx.filter(e=>(e.t+" "+e.s).toLowerCase().includes(q)).slice(0,8);
    res.innerHTML=hits.length?hits.map((h,i)=>`<button data-h="${idx.indexOf(h)}"><b>${h.t}</b><br><small>${h.s}</small></button>`).join(""):`<button disabled>No matches for “${box.value}”.</button>`;
    res.hidden=false;
    res.querySelectorAll("button[data-h]").forEach(b=>b.addEventListener("click",()=>{idx[+b.dataset.h].fn();res.hidden=true;box.value="";}));
  });
  document.addEventListener("click",e=>{if(!e.target.closest(".search-wrap"))res.hidden=true;});
}

/* ============================== EVENTS + INIT ============================== */
function toast(msg){ const t=$("#toast"); t.textContent=msg; t.hidden=false; setTimeout(()=>t.hidden=true,2200); }

function init(){
  renderMap(); renderDeptGrid(); renderWorkflows(); renderBatch(); renderTrouble(); renderCalcs(); renderGlossary(); initSearch();
  ["tMat","tInfo","tSup","tFb"].forEach(id=>$("#"+id).addEventListener("change",renderMap));
  $("#zoomIn").addEventListener("click",()=>{state.zoom=Math.min(2.2,state.zoom+0.15);applyZoom();});
  $("#zoomOut").addEventListener("click",()=>{state.zoom=Math.max(0.6,state.zoom-0.15);applyZoom();});
  $("#zoomReset").addEventListener("click",()=>{state.zoom=1;applyZoom();});
  document.querySelectorAll("[data-scroll]").forEach(b=>b.addEventListener("click",()=>document.querySelector(b.dataset.scroll).scrollIntoView({behavior:"smooth"})));
  document.querySelectorAll(".chip").forEach(c=>c.addEventListener("click",()=>{document.querySelectorAll(".chip").forEach(x=>x.classList.remove("active"));c.classList.add("active");state.cat=c.dataset.cat;renderDeptGrid();}));
  document.querySelectorAll(".nav-link").forEach(a=>a.addEventListener("click",()=>{document.querySelectorAll(".nav-link").forEach(x=>x.classList.remove("active"));a.classList.add("active");}));
  const setMode=m=>{state.mode=m;$("#btnBeginner").classList.toggle("active",m==="beginner");$("#btnPro").classList.toggle("active",m==="pro");
    $("#btnBeginner").setAttribute("aria-pressed",m==="beginner");$("#btnPro").setAttribute("aria-pressed",m==="pro");
    renderDeptGrid();toast(m==="beginner"?"Beginner mode: simplified wording":"Professional mode: full technical detail");};
  $("#btnBeginner").addEventListener("click",()=>setMode("beginner"));
  $("#btnPro").addEventListener("click",()=>setMode("pro"));
  $("#batchSelect").addEventListener("change",e=>{state.batch=e.target.value;state.batchIdx=0;state.traceIdx=BATCHES[state.batch].trace.length-1;renderBatch();});
  $("#batchPrev").addEventListener("click",()=>{state.batchIdx=Math.max(0,state.batchIdx-1);renderBatch();});
  $("#batchNext").addEventListener("click",()=>{const n=BATCHES[state.batch].stages.length-1;state.batchIdx=Math.min(n,state.batchIdx+1);renderBatch();});
  $("#glossSearch").addEventListener("input",e=>renderGlossary(e.target.value));
  $("#drawerClose").addEventListener("click",closeDrawer);
  $("#drawerOverlay").addEventListener("click",closeDrawer);
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closeDrawer();});
  state.traceIdx=BATCHES[state.batch].trace.length-1;
  renderBatch();
}
document.addEventListener("DOMContentLoaded",init);
