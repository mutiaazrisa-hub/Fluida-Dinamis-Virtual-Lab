/* Tantangan, kuis evaluasi akhir, dan laporan praktikum */
/* ================= CHALLENGE MODE LOGIC ================= */
        function checkChallenge1() {
            const A = parseFloat(document.getElementById('ch1_in_A').value);
            const v = parseFloat(document.getElementById('ch1_in_v').value);
            const Q = (A * 1e-4) * v;

            const fb = document.getElementById('ch1_feedback');
            if (!isFinite(A) || !isFinite(v)) {
                fb.className = 'text-[11px] text-amber-400 font-bold';
                fb.innerText = 'Isi nilai A dan v terlebih dahulu.';
                return;
            }
            if (Math.abs(Q - 0.005) < 0.0001) {
                fb.className = 'text-[11px] text-emerald-400 font-bold';
                fb.innerText = 'Tepat Sekali! Debit Q = 0.005 m³/s dicapai.';
                document.getElementById('ch1_status').innerText = '✓ Selesai';
                document.getElementById('ch1_status').className = 'text-xs text-emerald-400 font-bold';
                audio.playSuccess();
            } else {
                fb.className = 'text-[11px] text-rose-400 font-bold';
                fb.innerText = 'Belum Tepat. Hasil Q Anda = ' + Q.toFixed(5) + ' m³/s. Petunjuk: Q = (A × 10⁻⁴) × v = 0.005';
                audio.playWrong();
            }
        }

        function checkChallenge2() {
            const v2_ans = parseFloat(document.getElementById('ch2_in_v2').value);
            // A1=30, v1=2.0, A2=12 -> v2 = (30 * 2) / 12 = 5.0 m/s
            const fb = document.getElementById('ch2_feedback');
            if (!isFinite(v2_ans)) {
                fb.className = 'text-[11px] text-amber-400 font-bold';
                fb.innerText = 'Isi jawaban v₂ terlebih dahulu.';
                return;
            }
            if (Math.abs(v2_ans - 5.0) < 0.1) {
                fb.className = 'text-[11px] text-emerald-400 font-bold';
                fb.innerText = 'Benar! v2 = (30 × 2) / 12 = 5.0 m/s.';
                document.getElementById('ch2_status').innerText = '✓ Selesai';
                document.getElementById('ch2_status').className = 'text-xs text-emerald-400 font-bold';
                audio.playSuccess();
            } else {
                fb.className = 'text-[11px] text-rose-400 font-bold';
                fb.innerText = 'Belum Tepat. Gunakan rumus A1 × v1 = A2 × v2.';
                audio.playWrong();
            }
        }

        function checkChallenge3() {
            const P2_ans = parseFloat(document.getElementById('ch3_in_P2').value);
            // P1=150, v1=v2, delta_h=2m -> P2 = 150 - (1000 * 9.8 * 2 / 1000) = 150 - 19.6 = 130.4 kPa
            const fb = document.getElementById('ch3_feedback');
            if (!isFinite(P2_ans)) {
                fb.className = 'text-[11px] text-amber-400 font-bold';
                fb.innerText = 'Isi jawaban P₂ terlebih dahulu.';
                return;
            }
            if (Math.abs(P2_ans - 130.4) < 0.5) {
                fb.className = 'text-[11px] text-emerald-400 font-bold';
                fb.innerText = 'Luar Biasa! P2 = 150 - (rho × g × h)/1000 = 130.4 kPa.';
                document.getElementById('ch3_status').innerText = '✓ Selesai';
                document.getElementById('ch3_status').className = 'text-xs text-emerald-400 font-bold';
                audio.playSuccess();
            } else {
                fb.className = 'text-[11px] text-rose-400 font-bold';
                fb.innerText = 'Belum Tepat. Petunjuk: Karena v1=v2, P2 = P1 - rho × g × (h2 - h1).';
                audio.playWrong();
            }
        }

        /* ================= EVALUASI AKHIR QUIZ ENGINE ================= */
        const quizData = [
            { q: "1. Satuan internasional (SI) untuk menyatakan debit fluida (Q) adalah...", opt: ["A. Liter/menit", "B. m³/s", "C. cm³/s", "D. kg/s"], ans: 1 },
            { q: "2. Sebuah selang air berpenampang 5 cm² mengalirkan air dengan kelajuan 3 m/s. Debit air tersebut adalah...", opt: ["A. 0.0015 m³/s", "B. 0.015 m³/s", "C. 0.15 m³/s", "D. 1.5 m³/s"], ans: 0 },
            { q: "3. Menurut Asas Kontinuitas, jika luas penampang pipa menyempit menjadi sepertiga dari ukuran semula, maka kelajuan air akan...", opt: ["A. Berkurang menjadi sepertiganya", "B. Tetap sama", "C. Meningkat menjadi 3 kali lipat", "D. Meningkat menjadi 9 kali lipat"], ans: 2 },
            { q: "4. Persamaan Kontinuitas A1·v1 = A2·v2 diturunkan berdasarkan hukum fisika yaitu...", opt: ["A. Hukum Kekekalan Energi", "B. Hukum Kekekalan Massa", "C. Hukum Kekekalan Momentum", "D. Hukum II Newton"], ans: 1 },
            { q: "5. Pada Persamaan Bernoulli P + ½ρv² + ρgh = konstan, suku ½ρv² mewakili...", opt: ["A. Energi potensial per satuan volume", "B. Energi kinetik per satuan volume", "C. Tekanan hidrostatik", "D. Daya aliran fluida"], ans: 1 },
            { q: "6. Air mengalir pada pipa mendatar (h1 = h2). Pada titik yang memiliki kelajuan paling tinggi, tekanan airnya akan...", opt: ["A. Paling besar", "B. Paling kecil", "C. Sama dengan titik lain", "D. Nol"], ans: 1 },
            { q: "7. Sayap pesawat terbang dirancang agar udara di bagian atas mengalir lebih cepat daripada di bagian bawah. Akibatnya...", opt: ["A. Tekanan di atas sayap lebih besar dari di bawah", "B. Tekanan di atas sayap lebih kecil dari di bawah", "C. Kecepatan udara tidak mempengaruhi tekanan", "D. Pesawat terdorong ke bawah"], ans: 1 },
            { q: "8. Jika fluida bersifat kompresibel (dapat dimampatkan), maka pernyataan yang BENAR adalah...", opt: ["A. Massa jenis fluida selalu konstan", "B. Debit massa tetap tetapi debit volume dapat berubah", "C. Kelajuan aliran selalu konstan", "D. Persamaan Bernoulli berlaku sempurna"], ans: 1 },
            { q: "9. Sebuah alat venturimeter tanpa manometer memiliki pipa besar berpenampang 10 cm² dan pipa sempit 5 cm². Jika debit air 0.002 m³/s, kelajuan air pada pipa sempit adalah...", opt: ["A. 2 m/s", "B. 4 m/s", "C. 8 m/s", "D. 10 m/s"], ans: 1 },
            { q: "10. Kebocoran kecil pada dinding tangki air di ketinggian h meter dari permukaan air akan memancarkan air dengan kecepatan awal sebesar (Persamaan Torricelli)...", opt: ["A. v = g·h", "B. v = √(2gh)", "C. v = 2gh", "D. v = √(gh)"], ans: 1 }
        ];

        function renderQuizQuestions() {
            const container = document.getElementById('quizContainer');
            container.innerHTML = quizData.map((item, qIdx) => `
                <div class="glass-card p-6 rounded-2xl border border-slate-700/60 space-y-3">
                    <p class="font-semibold text-white text-sm sm:text-base">${item.q}</p>
                    <div class="space-y-2 pt-1 text-xs sm:text-sm">
                        ${item.opt.map((optText, oIdx) => `
                            <label class="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 cursor-pointer border border-slate-700/50">
                                <input type="radio" name="quiz_q_${qIdx}" value="${oIdx}" class="text-emerald-500 focus:ring-emerald-400">
                                <span class="text-slate-200">${optText}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        }

        function submitQuiz() {
            const unanswered = quizData.filter((_, i) => !document.querySelector(`input[name="quiz_q_${i}"]:checked`)).length;
            if (unanswered > 0 && !confirm('Masih ada ' + unanswered + ' soal yang belum dijawab. Tetap kirim jawaban?')) {
                return;
            }
            let correct = 0;
            quizData.forEach((item, qIdx) => {
                const selected = document.querySelector(`input[name="quiz_q_${qIdx}"]:checked`);
                if (selected && parseInt(selected.value) === item.ans) {
                    correct++;
                }
            });

            const score = (correct / quizData.length) * 100;
            document.getElementById('quizScoreDisplay').innerText = Math.round(score) + ' / 100';
            safeLS.set('vlab_quiz_score', score);
            updateReportView();

            if (score >= 70) audio.playSuccess();
            else audio.playWrong();
        }

        /* ================= REPORT COMPILER & PRINT VIEW ================= */
        function saveP1ReportSection() {
            audio.playClick();
            const pred = document.querySelector('input[name="p1_pred"]:checked')?.value || '-';
            const conc = document.getElementById('p1_conclusion').value.trim() || 'Belum diisi.';
            safeLS.set('vlab_p1_pred', pred);
            safeLS.set('vlab_p1_conc', conc);
            updateReportView();
            alert('Hasil Pertemuan 1 Berhasil Disimpan ke Laporan!');
        }

        function saveP2ReportSection() {
            audio.playClick();
            const pred = document.querySelector('input[name="p2_pred"]:checked')?.value || '-';
            const conc = document.getElementById('p2_conclusion').value.trim() || 'Belum diisi.';
            safeLS.set('vlab_p2_pred', pred);
            safeLS.set('vlab_p2_conc', conc);
            updateReportView();
            alert('Hasil Pertemuan 2 Berhasil Disimpan ke Laporan!');
        }

        function saveP3ReportSection() {
            audio.playClick();
            const pred = document.querySelector('input[name="p3_pred"]:checked')?.value || '-';
            const conc = document.getElementById('p3_conclusion').value.trim() || 'Belum diisi.';
            safeLS.set('vlab_p3_pred', pred);
            safeLS.set('vlab_p3_conc', conc);
            updateReportView();
            alert('Hasil Pertemuan 3 Berhasil Disimpan ke Laporan!');
        }

        function restoreSavedInputs() {
            ['p1', 'p2', 'p3'].forEach(p => {
                const conc = safeLS.get('vlab_' + p + '_conc');
                const area = document.getElementById(p + '_conclusion');
                if (conc && area && conc !== 'Belum diisi.') area.value = conc;
                const pred = safeLS.get('vlab_' + p + '_pred');
                if (pred && pred !== '-') {
                    const radio = document.querySelector(`input[name="${p}_pred"][value="${pred}"]`);
                    if (radio) radio.checked = true;
                }
            });
            const score = safeLS.get('vlab_quiz_score');
            if (score !== null) {
                document.getElementById('quizScoreDisplay').innerText = Math.round(Number(score) || 0) + ' / 100';
            }
        }

        function updateReportView() {
            document.getElementById('reportPrintDate').innerText = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
            document.getElementById('repStudentName').innerText = state.student.name;
            document.getElementById('repStudentClass').innerText = state.student.class;
            document.getElementById('repStudentSchool').innerText = state.student.school;

            document.getElementById('repP1Pred').innerText = safeLS.get('vlab_p1_pred') || 'Belum dijawab';
            document.getElementById('repP1Conc').innerText = safeLS.get('vlab_p1_conc') || 'Belum diisi kesimpulan';

            document.getElementById('repP2Pred').innerText = safeLS.get('vlab_p2_pred') || 'Belum dijawab';
            document.getElementById('repP2Conc').innerText = safeLS.get('vlab_p2_conc') || 'Belum diisi kesimpulan';

            document.getElementById('repP3Pred').innerText = safeLS.get('vlab_p3_pred') || 'Belum dijawab';
            document.getElementById('repP3Conc').innerText = safeLS.get('vlab_p3_conc') || 'Belum diisi kesimpulan';

            document.getElementById('repQuizScore').innerText = (safeLS.get('vlab_quiz_score') || '0') + ' / 100';

            // Render mini tables in report
            renderReportMiniTable('repP1Table', state.p1.data, ['A (cm²)', 'v (m/s)', 't (s)', 'V (L)', 'Q (m³/s)'], ['A', 'v', 't', 'V', 'Q_eksp']);
            renderReportMiniTable('repP2Table', state.p2.data, ['A1 (cm²)', 'v1 (m/s)', 'A2 (cm²)', 'v2 (m/s)', 'Q (m³/s)'], ['A1', 'v1', 'A2', 'v2', 'Q1']);
            renderReportMiniTable('repP3Table', state.p3.data, ['P1 (kPa)', 'v1 (m/s)', 'h1 (m)', 'P2 (kPa)', 'v2 (m/s)', 'h2 (m)'], ['P1', 'v1', 'h1', 'P2', 'v2', 'h2']);
        }

        function renderReportMiniTable(elemId, dataArray, headers, keys) {
            const container = document.getElementById(elemId);
            if (!dataArray || dataArray.length === 0) {
                container.innerHTML = '<p class="text-slate-500 italic">Tidak ada data percobaan.</p>';
                return;
            }
            container.innerHTML = `
                <table class="w-full text-left border border-slate-700 text-[11px]">
                    <thead class="bg-slate-800 text-slate-300">
                        <tr>${headers.map(h => `<th class="p-1 border border-slate-700">${h}</th>`).join('')}</tr>
                    </thead>
                    <tbody>
                        ${dataArray.map(row => `
                            <tr>${keys.map(k => `<td class="p-1 border border-slate-700">${row[k]}</td>`).join('')}</tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
