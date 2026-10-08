/* Simulasi Pertemuan 1-3 (kanvas, tabel, perhitungan) dan grafik Chart.js */
/* ================= PERTEMUAN 1 PHYSICS & CANVAS ================= */
        function updateP1Sim() {
            state.p1.A = parseFloat(document.getElementById('p1_slider_A').value);
            state.p1.v = parseFloat(document.getElementById('p1_slider_v').value);

            document.getElementById('p1_val_A').innerText = state.p1.A + ' cm²';
            document.getElementById('p1_val_v').innerText = state.p1.v.toFixed(1) + ' m/s';

            // Calculations SI
            const A_m2 = state.p1.A * 1e-4; // cm² to m²
            const Q_m3s = A_m2 * state.p1.v; // m³/s
            const Q_Ls = Q_m3s * 1000; // Liter/s

            document.getElementById('p1_metric_Q').innerText = Q_m3s.toFixed(4) + ' m³/s';
            document.getElementById('p1_metric_Q_L').innerText = '(' + Q_Ls.toFixed(2) + ' L/s)';
        }

        function startP1Sim() {
            if (state.p1.running) return;
            audio.playClick();
            state.p1.running = true;

            state.p1.timerId = setInterval(() => {
                if (!state.p1.running) return;
                state.p1.t += 0.1;

                const A_m2 = state.p1.A * 1e-4;
                const Q_m3s = A_m2 * state.p1.v;
                state.p1.V += Q_m3s * 1000 * 0.1; // Accumulate volume in Liters

                document.getElementById('p1_metric_t').innerText = state.p1.t.toFixed(1) + 's';
                document.getElementById('p1_metric_V').innerText = state.p1.V.toFixed(2) + ' L';

                audio.updateWaterFlowSound(true, Q_m3s);
            }, 100);
        }

        function pauseP1Sim() {
            audio.playClick();
            state.p1.running = false;
            clearInterval(state.p1.timerId);
            audio.updateWaterFlowSound(false);
        }

        function resetP1Sim() {
            audio.playClick();
            pauseP1Sim();
            state.p1.t = 0;
            state.p1.V = 0;
            document.getElementById('p1_metric_t').innerText = '0.0s';
            document.getElementById('p1_metric_V').innerText = '0.00 L';
        }

        function recordP1Data() {
            if (state.p1.t === 0 || state.p1.V === 0) {
                alert('Jalankan simulasi (tombol Mulai) terlebih dahulu agar ada waktu dan volume yang bisa dicatat.');
                return;
            }
            audio.playRecord();
            const A_m2 = state.p1.A * 1e-4;
            const Q_teor = A_m2 * state.p1.v;
            const V_m3 = state.p1.V / 1000;
            const Q_eksp = V_m3 / state.p1.t;

            const entry = {
                id: Date.now(),
                A: state.p1.A,
                v: state.p1.v,
                t: state.p1.t.toFixed(1),
                V: state.p1.V.toFixed(2),
                Q_teor: Q_teor.toFixed(5),
                Q_eksp: Q_eksp.toFixed(5)
            };
            state.p1.data.push(entry);
            safeLS.set('vlab_p1_data', JSON.stringify(state.p1.data));
            renderP1Table();
            updateP1Charts();
        }

        function clearP1Data() {
            audio.playClick();
            state.p1.data = [];
            safeLS.remove('vlab_p1_data');
            renderP1Table();
            updateP1Charts();
        }

        function deleteP1Entry(id) {
            audio.playClick();
            state.p1.data = state.p1.data.filter(item => item.id !== id);
            safeLS.set('vlab_p1_data', JSON.stringify(state.p1.data));
            renderP1Table();
            updateP1Charts();
        }

        function renderP1Table() {
            const tbody = document.getElementById('p1TableBody');
            if (state.p1.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" class="p-4 text-center text-slate-500">Belum ada data dicatat. Jalankan simulasi lalu klik "Catat Data".</td></tr>';
                return;
            }
            tbody.innerHTML = state.p1.data.map((row, idx) => `
                <tr class="hover:bg-slate-800/50">
                    <td class="p-3 font-semibold">${idx + 1}</td>
                    <td class="p-3">${row.A}</td>
                    <td class="p-3">${row.v}</td>
                    <td class="p-3">${row.t}</td>
                    <td class="p-3 text-emerald-400 font-bold">${row.V}</td>
                    <td class="p-3 text-sky-400 font-mono">${row.Q_teor}</td>
                    <td class="p-3 text-amber-300 font-mono">${row.Q_eksp}</td>
                    <td class="p-3">
                        <button onclick="deleteP1Entry(${row.id})" class="text-rose-400 hover:text-rose-300"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        }

        // P1 Canvas Visuals (Tank Outlet -> Beaker Filling)
        let p1Canvas, p1Ctx;
        function initP1Canvas() {
            p1Canvas = document.getElementById('p1Canvas');
            if (!p1Canvas) return;
            p1Ctx = p1Canvas.getContext('2d');
            resizeCanvas(p1Canvas);
        }

        function resizeCanvas(canvas) {
            if (!canvas || !canvas.parentElement) return;
            const rect = canvas.parentElement.getBoundingClientRect();
            const width = Math.max(320, Math.floor(rect.width));
            const height = Math.max(220, Math.floor(rect.height));
            const dpr = Math.min(window.devicePixelRatio || 1, 2);

            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            }
        }

        function p1RenderLoop() {
            if (p1Canvas && p1Ctx) {
                const w = p1Canvas.clientWidth || 720;
                const h = p1Canvas.clientHeight || 360;
                p1Ctx.clearRect(0, 0, w, h);

                // Laboratory background
                const bg = p1Ctx.createLinearGradient(0, 0, 0, h);
                bg.addColorStop(0, '#0f172a');
                bg.addColorStop(1, '#111827');
                p1Ctx.fillStyle = bg;
                p1Ctx.fillRect(0, 0, w, h);

                // Grid for visual reference
                p1Ctx.save();
                p1Ctx.strokeStyle = 'rgba(148,163,184,.08)';
                p1Ctx.lineWidth = 1;
                for (let x = 0; x < w; x += 32) { p1Ctx.beginPath(); p1Ctx.moveTo(x,0); p1Ctx.lineTo(x,h); p1Ctx.stroke(); }
                for (let y = 0; y < h; y += 32) { p1Ctx.beginPath(); p1Ctx.moveTo(0,y); p1Ctx.lineTo(w,y); p1Ctx.stroke(); }
                p1Ctx.restore();

                const tankX = Math.max(28, w * 0.07);
                const tankW = Math.min(150, w * 0.19);
                const tankY = Math.max(48, h * 0.15);
                const tankH = Math.min(190, h * 0.58);
                const outletY = tankY + tankH * 0.68;
                const pipeH = 24;
                const pipeX = tankX + tankW;
                const beakerW = Math.min(118, w * 0.15);
                const beakerH = Math.min(150, h * 0.46);
                const beakerX = w - beakerW - Math.max(42, w * 0.08);
                const beakerY = h - beakerH - 48;

                // Tank shadow
                p1Ctx.fillStyle = 'rgba(0,0,0,.28)';
                p1Ctx.fillRect(tankX+7, tankY+8, tankW, tankH);

                // Tank body
                p1Ctx.fillStyle = '#334155';
                p1Ctx.fillRect(tankX, tankY, tankW, tankH);
                p1Ctx.strokeStyle = '#cbd5e1';
                p1Ctx.lineWidth = 2;
                p1Ctx.strokeRect(tankX, tankY, tankW, tankH);

                // Water inside tank
                const waterTop = tankY + 18;
                p1Ctx.fillStyle = 'rgba(14,165,233,.70)';
                p1Ctx.fillRect(tankX+3, waterTop, tankW-6, tankH-21);
                p1Ctx.strokeStyle = 'rgba(125,211,252,.7)';
                p1Ctx.beginPath();
                p1Ctx.moveTo(tankX+3, waterTop);
                p1Ctx.lineTo(tankX+tankW-3, waterTop);
                p1Ctx.stroke();

                // Water tank label
                p1Ctx.fillStyle = '#e2e8f0';
                p1Ctx.font = 'bold 13px system-ui';
                p1Ctx.textAlign = 'center';
                p1Ctx.fillText('Reservoir', tankX+tankW/2, tankY-12);
                p1Ctx.font = '11px system-ui';
                p1Ctx.fillStyle = '#7dd3fc';
                p1Ctx.fillText('V = ' + Number(state.p1.V || 0).toFixed(1) + ' L', tankX+tankW/2, tankY+35);

                // Outlet nozzle and pipe
                p1Ctx.fillStyle = '#64748b';
                p1Ctx.fillRect(pipeX-2, outletY-pipeH/2, Math.max(45, w*.11), pipeH);
                p1Ctx.fillStyle = '#94a3b8';
                p1Ctx.fillRect(pipeX+Math.max(45,w*.11)-4, outletY-pipeH/2-3, 8, pipeH+6);

                // Flow jet: straight and stable, with animated droplets
                const jetStart = pipeX + Math.max(45, w*.11) + 3;
                const jetEnd = beakerX + beakerW*0.52;
                const jetLen = Math.max(40, jetEnd-jetStart);
                if (state.p1.running) {
                    const flowSpeed = Math.max(0.7, Math.min(5, state.p1.v || 1));
                    const t = performance.now()/220;
                    p1Ctx.save();
                    p1Ctx.strokeStyle = 'rgba(56,189,248,.72)';
                    p1Ctx.lineWidth = Math.max(5, Math.min(12, 4 + state.p1.A*0.12));
                    p1Ctx.lineCap = 'round';
                    p1Ctx.beginPath();
                    p1Ctx.moveTo(jetStart, outletY);
                    p1Ctx.lineTo(jetEnd, beakerY+12);
                    p1Ctx.stroke();
                    for (let i=0;i<9;i++) {
                        const f=((t*flowSpeed/10+i/9)%1);
                        const x=jetStart+(jetEnd-jetStart)*f;
                        const y=outletY+(beakerY+12-outletY)*f + 2*Math.sin(f*18+i);
                        p1Ctx.beginPath(); p1Ctx.arc(x,y,Math.max(2,3.5-state.p1.A*.04),0,Math.PI*2);
                        p1Ctx.fillStyle='#7dd3fc'; p1Ctx.fill();
                    }
                    p1Ctx.restore();
                }

                // Measuring beaker / cylinder
                p1Ctx.fillStyle = 'rgba(226,232,240,.08)';
                p1Ctx.fillRect(beakerX, beakerY, beakerW, beakerH);
                p1Ctx.strokeStyle = '#cbd5e1';
                p1Ctx.lineWidth = 2;
                p1Ctx.strokeRect(beakerX, beakerY, beakerW, beakerH);
                const fillPct = Math.max(0, Math.min(1, Number(state.p1.V || 0)/20));
                const waterH = (beakerH-8)*fillPct;
                p1Ctx.fillStyle = 'rgba(16,185,129,.72)';
                p1Ctx.fillRect(beakerX+4, beakerY+beakerH-4-waterH, beakerW-8, waterH);
                // Scale marks
                p1Ctx.strokeStyle = '#94a3b8'; p1Ctx.lineWidth = 1; p1Ctx.font='10px system-ui'; p1Ctx.fillStyle='#cbd5e1'; p1Ctx.textAlign='left';
                for(let i=0;i<=4;i++){
                    const yy=beakerY+beakerH-4-(beakerH-8)*(i/4);
                    p1Ctx.beginPath(); p1Ctx.moveTo(beakerX+beakerW-22,yy); p1Ctx.lineTo(beakerX+beakerW-5,yy); p1Ctx.stroke();
                    p1Ctx.fillText((i*5)+' L',beakerX+beakerW-52,yy+3);
                }
                p1Ctx.textAlign='center'; p1Ctx.font='bold 12px system-ui'; p1Ctx.fillStyle='#a7f3d0';
                p1Ctx.fillText('Gelas ukur',beakerX+beakerW/2,beakerY+beakerH+20);

                // Flow information badge
                p1Ctx.fillStyle='rgba(15,23,42,.88)';
                p1Ctx.strokeStyle='rgba(56,189,248,.35)';
                p1Ctx.lineWidth=1;
                p1Ctx.beginPath(); p1Ctx.roundRect(Math.max(20,w*.35),18,Math.min(250,w*.34),48,12); p1Ctx.fill(); p1Ctx.stroke();
                p1Ctx.fillStyle='#e2e8f0'; p1Ctx.font='bold 12px system-ui'; p1Ctx.textAlign='left';
                p1Ctx.fillText('Aliran fluida',Math.max(34,w*.37),39);
                p1Ctx.fillStyle='#7dd3fc'; p1Ctx.font='11px system-ui';
                p1Ctx.fillText('A = '+Number(state.p1.A||0).toFixed(1)+' cm²   •   v = '+Number(state.p1.v||0).toFixed(2)+' m/s',Math.max(34,w*.37),56);
            }
            requestAnimationFrame(p1RenderLoop);
        }

        /* ================= PERTEMUAN 2 PHYSICS & CANVAS ================= */
        function updateP2Sim() {
            state.p2.A1 = parseFloat(document.getElementById('p2_slider_A1').value);
            state.p2.v1 = parseFloat(document.getElementById('p2_slider_v1').value);
            state.p2.A2 = parseFloat(document.getElementById('p2_slider_A2').value);

            document.getElementById('p2_val_A1').innerText = state.p2.A1 + ' cm²';
            document.getElementById('p2_val_v1').innerText = state.p2.v1.toFixed(1) + ' m/s';
            document.getElementById('p2_val_A2').innerText = state.p2.A2 + ' cm²';

            // Calculations
            const A1_m2 = state.p2.A1 * 1e-4;
            const A2_m2 = state.p2.A2 * 1e-4;
            const Q1 = A1_m2 * state.p2.v1;
            const v2 = (A1_m2 * state.p2.v1) / A2_m2;
            const Q2 = A2_m2 * v2;

            document.getElementById('p2_metric_Q1').innerText = Q1.toFixed(4) + ' m³/s';
            document.getElementById('p2_metric_v2').innerText = v2.toFixed(2) + ' m/s';
            document.getElementById('p2_metric_Q2').innerText = Q2.toFixed(4) + ' m³/s';
        }

        function resetP2Sim() {
            audio.playClick();
            document.getElementById('p2_slider_A1').value = 20;
            document.getElementById('p2_slider_v1').value = 2.0;
            document.getElementById('p2_slider_A2').value = 10;
            updateP2Sim();
        }

        function recordP2Data() {
            audio.playRecord();
            const A1_m2 = state.p2.A1 * 1e-4;
            const A2_m2 = state.p2.A2 * 1e-4;
            const Q1 = A1_m2 * state.p2.v1;
            const v2 = (A1_m2 * state.p2.v1) / A2_m2;
            const Q2 = A2_m2 * v2;

            const entry = {
                id: Date.now(),
                A1: state.p2.A1,
                v1: state.p2.v1,
                Q1: Q1.toFixed(5),
                A2: state.p2.A2,
                v2: v2.toFixed(2),
                Q2: Q2.toFixed(5)
            };
            state.p2.data.push(entry);
            safeLS.set('vlab_p2_data', JSON.stringify(state.p2.data));
            renderP2Table();
            updateP2Charts();
        }

        function clearP2Data() {
            audio.playClick();
            state.p2.data = [];
            safeLS.remove('vlab_p2_data');
            renderP2Table();
            updateP2Charts();
        }

        function deleteP2Entry(id) {
            audio.playClick();
            state.p2.data = state.p2.data.filter(item => item.id !== id);
            safeLS.set('vlab_p2_data', JSON.stringify(state.p2.data));
            renderP2Table();
            updateP2Charts();
        }

        function renderP2Table() {
            const tbody = document.getElementById('p2TableBody');
            if (state.p2.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" class="p-4 text-center text-slate-500">Belum ada data dicatat. Atur slider lalu klik "Catat Data".</td></tr>';
                return;
            }
            tbody.innerHTML = state.p2.data.map((row, idx) => `
                <tr class="hover:bg-slate-800/50">
                    <td class="p-3 font-semibold">${idx + 1}</td>
                    <td class="p-3">${row.A1}</td>
                    <td class="p-3">${row.v1}</td>
                    <td class="p-3 text-blue-400 font-mono">${row.Q1}</td>
                    <td class="p-3">${row.A2}</td>
                    <td class="p-3 text-amber-400 font-bold">${row.v2}</td>
                    <td class="p-3 text-emerald-400 font-mono">${row.Q2}</td>
                    <td class="p-3">
                        <button onclick="deleteP2Entry(${row.id})" class="text-rose-400 hover:text-rose-300"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        }

        // Canvas for Continuity Streamlines & Particles
        let p2Canvas, p2Ctx, p2Particles = [];
        function initP2Canvas() {
            p2Canvas = document.getElementById('p2Canvas');
            if (!p2Canvas) return;
            p2Ctx = p2Canvas.getContext('2d');
            resizeCanvas(p2Canvas);

            p2Particles = [];
            for (let i = 0; i < 60; i++) {
                p2Particles.push({
                    x: Math.random() * (p2Canvas.clientWidth || 400),
                    y: Math.random(), // normalized 0 to 1 inside pipe profile
                    speedMultiplier: 1.0
                });
            }
        }

        function p2RenderLoop() {
            if (p2Canvas && p2Ctx) {
                const w = p2Canvas.clientWidth || 720;
                const h = p2Canvas.clientHeight || 340;
                p2Ctx.clearRect(0, 0, w, h);
                const h1 = Math.max(58, Math.min(125, state.p2.A1 * 3));
                const h2 = Math.max(34, Math.min(105, state.p2.A2 * 3));
                const centerY = h * 0.55;
                const x1 = w * 0.08, x2 = w * 0.40, x3 = w * 0.60, x4 = w * 0.92;

                // Background
                p2Ctx.fillStyle='#0f172a'; p2Ctx.fillRect(0,0,w,h);
                p2Ctx.strokeStyle='rgba(148,163,184,.07)'; p2Ctx.lineWidth=1;
                for(let x=0;x<w;x+=32){p2Ctx.beginPath();p2Ctx.moveTo(x,0);p2Ctx.lineTo(x,h);p2Ctx.stroke();}
                for(let y=0;y<h;y+=32){p2Ctx.beginPath();p2Ctx.moveTo(0,y);p2Ctx.lineTo(w,y);p2Ctx.stroke();}

                // Pipe profile
                p2Ctx.beginPath();
                p2Ctx.moveTo(x1,centerY-h1/2); p2Ctx.lineTo(x2,centerY-h1/2);
                p2Ctx.lineTo(x3,centerY-h2/2); p2Ctx.lineTo(x4,centerY-h2/2);
                p2Ctx.lineTo(x4,centerY+h2/2); p2Ctx.lineTo(x3,centerY+h2/2);
                p2Ctx.lineTo(x2,centerY+h1/2); p2Ctx.lineTo(x1,centerY+h1/2); p2Ctx.closePath();
                const grad=p2Ctx.createLinearGradient(0,centerY-h1/2,0,centerY+h1/2); grad.addColorStop(0,'rgba(56,189,248,.30)'); grad.addColorStop(1,'rgba(14,165,233,.10)');
                p2Ctx.fillStyle=grad; p2Ctx.fill(); p2Ctx.strokeStyle='#38bdf8'; p2Ctx.lineWidth=3; p2Ctx.stroke();

                // Section labels and dimension arrows
                p2Ctx.fillStyle='#e2e8f0'; p2Ctx.font='bold 13px system-ui'; p2Ctx.textAlign='center';
                p2Ctx.fillText('Penampang 1',x1+(x2-x1)*.48,centerY-h1/2-24);
                p2Ctx.fillText('Penampang 2',x3+(x4-x3)*.52,centerY-h2/2-24);
                p2Ctx.fillStyle='#7dd3fc'; p2Ctx.font='11px system-ui';
                p2Ctx.fillText('A₁ = '+state.p2.A1+' cm²',x1+(x2-x1)*.48,centerY-h1/2-8);
                p2Ctx.fillStyle='#fbbf24'; p2Ctx.fillText('A₂ = '+state.p2.A2+' cm²',x3+(x4-x3)*.52,centerY-h2/2-8);

                // Animated particles with normalized coordinates
                const v2=(state.p2.A1*state.p2.v1)/state.p2.A2;
                const speedBase=Math.max(.6,Math.min(4,state.p2.v1*.9));
                p2Particles.forEach((pt,i)=>{
                    let localH=h1, speed=speedBase;
                    if(pt.x>=x2 && pt.x<=x3){const f=(pt.x-x2)/(x3-x2);localH=h1+(h2-h1)*f;speed=speedBase+(Math.max(.6,Math.min(6,v2*.9))-speedBase)*f;}
                    else if(pt.x>x3){localH=h2;speed=Math.max(.6,Math.min(6,v2*.9));}
                    pt.x += speed;
                    if(pt.x>x4+8) pt.x=x1-5;
                    const py=centerY-localH/2+pt.y*localH;
                    p2Ctx.beginPath();p2Ctx.arc(pt.x,py,2.6,0,Math.PI*2);p2Ctx.fillStyle=pt.x>x3?'#fbbf24':'#7dd3fc';p2Ctx.fill();
                });

                // Velocity arrows
                const drawArrow=(x,y,len,color,label)=>{p2Ctx.strokeStyle=color;p2Ctx.fillStyle=color;p2Ctx.lineWidth=3;p2Ctx.beginPath();p2Ctx.moveTo(x,y);p2Ctx.lineTo(x+len,y);p2Ctx.stroke();p2Ctx.beginPath();p2Ctx.moveTo(x+len,y);p2Ctx.lineTo(x+len-8,y-5);p2Ctx.lineTo(x+len-8,y+5);p2Ctx.closePath();p2Ctx.fill();p2Ctx.font='bold 11px system-ui';p2Ctx.textAlign='center';p2Ctx.fillText(label,x+len/2,y-9);};
                drawArrow(x1+20,centerY,state.p2.v1*25,'#38bdf8','v₁ = '+state.p2.v1.toFixed(1)+' m/s');
                drawArrow(x3+20,centerY+Math.max(50,h2),Math.min(120,v2*25),'#fbbf24','v₂ = '+v2.toFixed(2)+' m/s');

                // Continuity badge
                p2Ctx.fillStyle='rgba(15,23,42,.9)';p2Ctx.strokeStyle='rgba(52,211,153,.4)';p2Ctx.beginPath();p2Ctx.roundRect(w*.34, h-54, w*.32, 34,10);p2Ctx.fill();p2Ctx.stroke();
                p2Ctx.fillStyle='#a7f3d0';p2Ctx.font='bold 12px system-ui';p2Ctx.textAlign='center';p2Ctx.fillText('Q tetap  •  A₁v₁ = A₂v₂',w*.50,h-32);
            }
            requestAnimationFrame(p2RenderLoop);
        }

        /* ================= PERTEMUAN 3 PHYSICS & CANVAS ================= */
        function setP3Mode(mode) {
            audio.playClick();
            state.p3.mode = mode;
            ['A', 'B', 'C'].forEach(m => {
                const btn = document.getElementById('btn-mode-' + m);
                if (m === mode) {
                    btn.className = 'px-4 py-2 rounded-xl text-xs font-bold transition bg-indigo-600 text-white shadow-lg shadow-indigo-600/30';
                } else {
                    btn.className = 'px-4 py-2 rounded-xl text-xs font-bold transition bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700';
                }
            });

            const h2Slider = document.getElementById('p3_slider_h2');
            h2Slider.disabled = (mode === 'A');
            h2Slider.classList.toggle('opacity-40', mode === 'A');
            if (mode === 'A') {
                document.getElementById('p3_slider_h1').value = 0;
                h2Slider.value = 0;
            } else if (mode === 'B') {
                document.getElementById('p3_slider_A2_ratio').value = 1.0;
            }
            updateP3Sim();
        }

        function updateP3Sim() {
            state.p3.P1 = parseFloat(document.getElementById('p3_slider_P1').value);
            state.p3.v1 = parseFloat(document.getElementById('p3_slider_v1').value);
            state.p3.h1 = parseFloat(document.getElementById('p3_slider_h1').value);
            // Mode A: ketinggian sama (h1 = h2), jadi h2 mengikuti h1
            if (state.p3.mode === 'A') {
                document.getElementById('p3_slider_h2').value = state.p3.h1;
            }
            state.p3.A2_ratio = parseFloat(document.getElementById('p3_slider_A2_ratio').value);
            state.p3.h2 = parseFloat(document.getElementById('p3_slider_h2').value);

            document.getElementById('p3_val_P1').innerText = state.p3.P1 + ' kPa';
            document.getElementById('p3_val_v1').innerText = state.p3.v1.toFixed(1) + ' m/s';
            document.getElementById('p3_val_h1').innerText = state.p3.h1.toFixed(1) + ' m';
            document.getElementById('p3_val_A2_ratio').innerText = state.p3.A2_ratio.toFixed(1) + 'x Sempit';
            document.getElementById('p3_val_h2').innerText = state.p3.h2.toFixed(1) + ' m';

            // Bernoulli Calculations SI Units
            const rho = 1000; // kg/m³
            const g = 9.8; // m/s²
            const P1_Pa = state.p3.P1 * 1000;
            const v2 = state.p3.v1 * state.p3.A2_ratio;

            // P1 + 0.5*rho*v1^2 + rho*g*h1 = P2 + 0.5*rho*v2^2 + rho*g*h2
            const E_total = P1_Pa + 0.5 * rho * Math.pow(state.p3.v1, 2) + rho * g * state.p3.h1;
            const P2_Pa = E_total - (0.5 * rho * Math.pow(v2, 2) + rho * g * state.p3.h2);
            const P2_kPa = P2_Pa / 1000;

            document.getElementById('p3_metric_v2').innerText = v2.toFixed(2) + ' m/s';
            document.getElementById('p3_metric_P2').innerText = P2_kPa.toFixed(2) + ' kPa';
            document.getElementById('p3_metric_energy_total').innerText = 'Total = ' + (E_total / 1000).toFixed(1) + ' kJ/m³';

            // Stacked Bar Percentages
            const E_press = Math.max(P2_Pa, 0);
            const E_kin = 0.5 * rho * Math.pow(v2, 2);
            const E_pot = rho * g * state.p3.h2;
            const sum = E_press + E_kin + E_pot;

            const pct = (val) => (sum > 0 ? (val / sum) * 100 : 0).toFixed(2) + '%';
            document.getElementById('p3_bar_press').style.width = pct(E_press);
            document.getElementById('p3_bar_kin').style.width = pct(E_kin);
            document.getElementById('p3_bar_pot').style.width = pct(E_pot);
        }

        function resetP3Sim() {
            audio.playClick();
            document.getElementById('p3_slider_P1').value = 150;
            document.getElementById('p3_slider_v1').value = 2.0;
            document.getElementById('p3_slider_h1').value = 0;
            document.getElementById('p3_slider_A2_ratio').value = 2.0;
            document.getElementById('p3_slider_h2').value = 0;
            updateP3Sim();
        }

        function recordP3Data() {
            audio.playRecord();
            const rho = 1000, g = 9.8;
            const P1_Pa = state.p3.P1 * 1000;
            const v2 = state.p3.v1 * state.p3.A2_ratio;
            const E_total = (P1_Pa + 0.5 * rho * Math.pow(state.p3.v1, 2) + rho * g * state.p3.h1) / 1000; // kJ/m³
            const P2_kPa = (P1_Pa + 0.5 * rho * (Math.pow(state.p3.v1, 2) - Math.pow(v2, 2)) + rho * g * (state.p3.h1 - state.p3.h2)) / 1000;

            const entry = {
                id: Date.now(),
                P1: state.p3.P1,
                v1: state.p3.v1,
                h1: state.p3.h1,
                P2: P2_kPa.toFixed(2),
                v2: v2.toFixed(2),
                h2: state.p3.h2,
                E_total: E_total.toFixed(1)
            };
            state.p3.data.push(entry);
            safeLS.set('vlab_p3_data', JSON.stringify(state.p3.data));
            renderP3Table();
            updateP3Charts();
        }

        function clearP3Data() {
            audio.playClick();
            state.p3.data = [];
            safeLS.remove('vlab_p3_data');
            renderP3Table();
            updateP3Charts();
        }

        function deleteP3Entry(id) {
            audio.playClick();
            state.p3.data = state.p3.data.filter(item => item.id !== id);
            safeLS.set('vlab_p3_data', JSON.stringify(state.p3.data));
            renderP3Table();
            updateP3Charts();
        }

        function renderP3Table() {
            const tbody = document.getElementById('p3TableBody');
            if (state.p3.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9" class="p-4 text-center text-slate-500">Belum ada data dicatat. Atur variabel lalu klik "Catat Data".</td></tr>';
                return;
            }
            tbody.innerHTML = state.p3.data.map((row, idx) => `
                <tr class="hover:bg-slate-800/50">
                    <td class="p-3 font-semibold">${idx + 1}</td>
                    <td class="p-3">${row.P1}</td>
                    <td class="p-3">${row.v1}</td>
                    <td class="p-3">${row.h1}</td>
                    <td class="p-3 text-emerald-400 font-bold">${row.P2}</td>
                    <td class="p-3 text-amber-300 font-bold">${row.v2}</td>
                    <td class="p-3">${row.h2}</td>
                    <td class="p-3 text-indigo-400 font-mono">${row.E_total}</td>
                    <td class="p-3">
                        <button onclick="deleteP3Entry(${row.id})" class="text-rose-400 hover:text-rose-300"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        }

        // P3 Canvas Render
        let p3Canvas, p3Ctx;
        function initP3Canvas() {
            p3Canvas = document.getElementById('p3Canvas');
            if (!p3Canvas) return;
            p3Ctx = p3Canvas.getContext('2d');
            resizeCanvas(p3Canvas);
        }

        function p3RenderLoop() {
            if (p3Canvas && p3Ctx) {
                const w = p3Canvas.clientWidth || 720;
                const h = p3Canvas.clientHeight || 360;
                p3Ctx.clearRect(0,0,w,h);
                p3Ctx.fillStyle='#0f172a';p3Ctx.fillRect(0,0,w,h);
                p3Ctx.strokeStyle='rgba(148,163,184,.07)';p3Ctx.lineWidth=1;
                for(let x=0;x<w;x+=32){p3Ctx.beginPath();p3Ctx.moveTo(x,0);p3Ctx.lineTo(x,h);p3Ctx.stroke();}
                for(let y=0;y<h;y+=32){p3Ctx.beginPath();p3Ctx.moveTo(0,y);p3Ctx.lineTo(w,y);p3Ctx.stroke();}

                const yBase=h*.67;
                const y1=yBase-state.p3.h1*18;
                const y2=yBase-state.p3.h2*18;
                const r1=28, r2=Math.max(12,Math.min(28,28/state.p3.A2_ratio));
                const xa=w*.10, xb=w*.42, xc=w*.58, xd=w*.90;

                // Elevation reference
                p3Ctx.strokeStyle='rgba(148,163,184,.28)';p3Ctx.setLineDash([5,5]);p3Ctx.beginPath();p3Ctx.moveTo(30,yBase);p3Ctx.lineTo(w-30,yBase);p3Ctx.stroke();p3Ctx.setLineDash([]);
                p3Ctx.fillStyle='#94a3b8';p3Ctx.font='10px system-ui';p3Ctx.textAlign='left';p3Ctx.fillText('z = 0',32,yBase-5);

                // Pipe body
                p3Ctx.beginPath();p3Ctx.moveTo(xa,y1-r1);p3Ctx.lineTo(xb,y1-r1);p3Ctx.lineTo(xc,y2-r2);p3Ctx.lineTo(xd,y2-r2);p3Ctx.lineTo(xd,y2+r2);p3Ctx.lineTo(xc,y2+r2);p3Ctx.lineTo(xb,y1+r1);p3Ctx.lineTo(xa,y1+r1);p3Ctx.closePath();
                const grad=p3Ctx.createLinearGradient(0,0,0,h);grad.addColorStop(0,'rgba(99,102,241,.32)');grad.addColorStop(1,'rgba(59,130,246,.08)');p3Ctx.fillStyle=grad;p3Ctx.fill();p3Ctx.strokeStyle='#818cf8';p3Ctx.lineWidth=3;p3Ctx.stroke();

                // Flow particles
                const v1=Math.max(.2,state.p3.v1), v2=v1*state.p3.A2_ratio;
                for(let i=0;i<20;i++){
                    const f=((performance.now()/180*(v1/3)+i/20)%1);
                    const x=xa+(xd-xa)*f;
                    let yy, rr;
                    if(x<xb){yy=y1;rr=r1;}else if(x<xc){const q=(x-xb)/(xc-xb);yy=y1+(y2-y1)*q;rr=r1+(r2-r1)*q;}else{yy=y2;rr=r2;}
                    const py=yy+(i%4-1.5)*rr*.25;
                    p3Ctx.beginPath();p3Ctx.arc(x,py,2.5,0,Math.PI*2);p3Ctx.fillStyle=x>xc?'#34d399':'#60a5fa';p3Ctx.fill();
                }

                // Pressure/height indicators
                const drawProbe=(x,y,color,label,value,side)=>{
                    p3Ctx.strokeStyle=color;p3Ctx.lineWidth=2;p3Ctx.beginPath();p3Ctx.moveTo(x,y);p3Ctx.lineTo(x,y-72);p3Ctx.stroke();
                    p3Ctx.fillStyle=color;p3Ctx.fillRect(x-7,y-72,14,Math.max(8,Math.min(55,value*.22)));
                    p3Ctx.fillStyle='#e2e8f0';p3Ctx.font='bold 11px system-ui';p3Ctx.textAlign=side==='left'?'left':'right';p3Ctx.fillText(label,side==='left'?x+12:x-12,y-82);p3Ctx.font='10px system-ui';p3Ctx.fillStyle='#cbd5e1';p3Ctx.fillText(value.toFixed(1)+' kPa',side==='left'?x+12:x-12,y-67);
                };
                drawProbe(xa+45,y1,'#38bdf8','Titik 1',state.p3.P1,'left');
                const P2=Math.max(0,(state.p3.P1*1000+0.5*1000*(v1*v1-v2*v2)+1000*9.8*(state.p3.h1-state.p3.h2))/1000);
                drawProbe(xd-45,y2,'#34d399','Titik 2',P2,'right');

                // Height markers
                p3Ctx.strokeStyle='#fbbf24';p3Ctx.lineWidth=2;p3Ctx.beginPath();p3Ctx.moveTo(w*.04,y1);p3Ctx.lineTo(w*.04,yBase);p3Ctx.stroke();p3Ctx.beginPath();p3Ctx.moveTo(w*.03,y1);p3Ctx.lineTo(w*.05,y1);p3Ctx.moveTo(w*.03,yBase);p3Ctx.lineTo(w*.05,yBase);p3Ctx.stroke();p3Ctx.fillStyle='#fbbf24';p3Ctx.font='10px system-ui';p3Ctx.textAlign='left';p3Ctx.fillText('h₁ = '+state.p3.h1.toFixed(1)+' m',w*.055,y1+4);
                p3Ctx.beginPath();p3Ctx.moveTo(w*.96,y2);p3Ctx.lineTo(w*.96,yBase);p3Ctx.stroke();p3Ctx.beginPath();p3Ctx.moveTo(w*.95,y2);p3Ctx.lineTo(w*.97,y2);p3Ctx.moveTo(w*.95,yBase);p3Ctx.lineTo(w*.97,yBase);p3Ctx.stroke();p3Ctx.textAlign='right';p3Ctx.fillText('h₂ = '+state.p3.h2.toFixed(1)+' m',w*.945,y2+4);

                // Main energy equation badge
                p3Ctx.fillStyle='rgba(15,23,42,.92)';p3Ctx.strokeStyle='rgba(129,140,248,.45)';p3Ctx.beginPath();p3Ctx.roundRect(w*.23,16,w*.54,50,12);p3Ctx.fill();p3Ctx.stroke();
                p3Ctx.fillStyle='#c7d2fe';p3Ctx.font='bold 12px system-ui';p3Ctx.textAlign='center';p3Ctx.fillText('Persamaan Bernoulli',w*.50,36);p3Ctx.fillStyle='#e0e7ff';p3Ctx.font='11px system-ui';p3Ctx.fillText('P + ½ρv² + ρgh = konstan',w*.50,54);
            }
            requestAnimationFrame(p3RenderLoop);
        }

        /* ================= CHART.JS INITIALIZATIONS ================= */
        function initCharts() {
            if (typeof Chart === 'undefined') {
                console.warn('Chart.js tidak termuat (cek koneksi internet). Grafik dinonaktifkan.');
                return;
            }
            const baseConfig = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#94a3b8' } } },
                scales: {
                    x: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } },
                    y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } }
                }
            };
            // Setiap grafik mendapat salinan opsi sendiri (objek opsi tidak boleh dipakai bersama)
            const chartConfig = () => JSON.parse(JSON.stringify(baseConfig));

            // P1 Charts
            chartP1Vt = new Chart(document.getElementById('p1ChartVt'), {
                type: 'line',
                data: { labels: [], datasets: [{ label: 'Volume V (L)', data: [], borderColor: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.2)', fill: true }] },
                options: chartConfig()
            });
            chartP1QA = new Chart(document.getElementById('p1ChartQA'), {
                type: 'bar',
                data: { labels: [], datasets: [{ label: 'Debit Q (m³/s)', data: [], backgroundColor: '#10b981' }] },
                options: chartConfig()
            });

            // P2 Charts
            chartP2Av = new Chart(document.getElementById('p2ChartAv'), {
                type: 'scatter',
                data: { datasets: [{ label: 'Rasio A1/A2 vs v2', data: [], borderColor: '#f59e0b', backgroundColor: '#f59e0b', showLine: true }] },
                options: chartConfig()
            });
            chartP2Q1Q2 = new Chart(document.getElementById('p2ChartQ1Q2'), {
                type: 'bar',
                data: { labels: [], datasets: [{ label: 'Q1', data: [], backgroundColor: '#3b82f6' }, { label: 'Q2', data: [], backgroundColor: '#10b981' }] },
                options: chartConfig()
            });

            // P3 Charts
            chartP3Pv = new Chart(document.getElementById('p3ChartPv'), {
                type: 'line',
                data: { labels: [], datasets: [{ label: 'Tekanan P2 (kPa)', data: [], borderColor: '#6366f1', fill: false }] },
                options: chartConfig()
            });
            chartP3Ph = new Chart(document.getElementById('p3ChartPh'), {
                type: 'line',
                data: { labels: [], datasets: [{ label: 'Tekanan P2 (kPa)', data: [], borderColor: '#10b981', fill: false }] },
                options: chartConfig()
            });
        }

        function updateP1Charts() {
            if (!chartP1Vt) return;
            chartP1Vt.data.labels = state.p1.data.map(d => d.t + 's');
            chartP1Vt.data.datasets[0].data = state.p1.data.map(d => parseFloat(d.V));
            chartP1Vt.update();

            chartP1QA.data.labels = state.p1.data.map(d => d.A + ' cm²');
            chartP1QA.data.datasets[0].data = state.p1.data.map(d => parseFloat(d.Q_eksp));
            chartP1QA.update();
        }

        function updateP2Charts() {
            if (!chartP2Av) return;
            chartP2Av.data.datasets[0].data = state.p2.data.map(d => ({ x: d.A1 / d.A2, y: parseFloat(d.v2) }));
            chartP2Av.update();

            chartP2Q1Q2.data.labels = state.p2.data.map((_, i) => 'Exp ' + (i + 1));
            chartP2Q1Q2.data.datasets[0].data = state.p2.data.map(d => parseFloat(d.Q1));
            chartP2Q1Q2.data.datasets[1].data = state.p2.data.map(d => parseFloat(d.Q2));
            chartP2Q1Q2.update();
        }

        function updateP3Charts() {
            if (!chartP3Pv) return;
            chartP3Pv.data.labels = state.p3.data.map(d => d.v2 + ' m/s');
            chartP3Pv.data.datasets[0].data = state.p3.data.map(d => parseFloat(d.P2));
            chartP3Pv.update();

            chartP3Ph.data.labels = state.p3.data.map(d => d.h2 + ' m');
            chartP3Ph.data.datasets[0].data = state.p3.data.map(d => parseFloat(d.P2));
            chartP3Ph.update();
        }
