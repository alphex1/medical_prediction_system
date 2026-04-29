import jsPDF from "jspdf";
import React, { useEffect, useRef } from 'react';
import './Results.css';

const URGENCY_COLOR = { High: '#ff4d6d', Medium: '#ffb347', Low: '#00d4aa' };
const URGENCY_BG = { High: 'rgba(255,77,109,0.10)', Medium: 'rgba(255,179,71,0.10)', Low: 'rgba(0,212,170,0.10)' };
const URGENCY_LABEL = { High: '🔴 Seek care soon', Medium: '🟡 Consult a doctor', Low: '🟢 Monitor & rest' };

function ConfidenceRing({ value, color }) {
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (value / 100) * circ;

  return (
    <div className="ring-container">
      <svg width="130" height="130" viewBox="0 0 130 130">

        {/* Glow background */}
        <circle
          cx="65" cy="65" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="14"
          opacity="0.15"
        />

        {/* Base circle */}
        <circle
          cx="65" cy="65" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="10"
        />

        {/* Animated progress */}
        <circle
          cx="65" cy="65" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 65 65)"
          className="ring-progress"
        />

        {/* Center text */}
        <text x="65" y="60" textAnchor="middle" fill="white" fontSize="22" fontWeight="600">
          {Math.round(value)}%
        </text>
        <text x="65" y="78" textAnchor="middle" fill="#8888aa" fontSize="11">
          confidence
        </text>
      </svg>
    </div>
  );
}

function AltBar({ disease, confidence, color }) {
  return (
    <div className="res-alt-item">
      <div className="res-alt-top">
        <span className="res-alt-name">{disease}</span>
        <span className="res-alt-pct" style={{ color }}>{confidence.toFixed(1)}%</span>
      </div>
      <div className="res-alt-track">
        <div
          className="res-alt-fill"
          style={{ width: `${confidence}%`, background: color, transition: 'width 1s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </div>
    </div>
  );
}

export default function Results({ data, onReset, onBack, user }) {
  const top = data.top_prediction;
  const alts = data.alternatives || [];
  const urgencyColor = URGENCY_COLOR[top.urgency] || '#00d4aa';

  const downloadReport = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const u = user || {};
    const pageW = 210;
    const pageH = 297;
    const margin = 14;
    const contentW = pageW - margin * 2;



    // ── Helpers ──────────────────────────────────────────────────────────────
    const hex2rgb = (hex) => {
      const h = hex.replace('#', '');
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    };
    const urgencyHex = { High: '#ff4d6d', Medium: '#ffb347', Low: '#00d4aa' };
    const urgencyBadge = { High: 'HIGH URGENCY', Medium: 'MODERATE', Low: 'LOW URGENCY' };
    const accentHex = urgencyHex[top.urgency] || '#00d4aa';
    const [ar, ag, ab] = hex2rgb(accentHex);

    const sectionTitle = (label, y) => {
      // pill background
      doc.setFillColor(ar, ag, ab);
      doc.roundedRect(margin, y, contentW, 8, 1.5, 1.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(label.toUpperCase(), margin + 4, y + 5.5);
      doc.setFont('helvetica', 'normal');
      return y + 12;
    };

    // ── COVER HEADER ─────────────────────────────────────────────────────────
    // Dark navy background bar
    doc.setFillColor(10, 14, 30);
    doc.rect(0, 0, pageW, 42, 'F');

    // Accent stripe
    doc.setFillColor(ar, ag, ab);
    doc.rect(0, 42, pageW, 3, 'F');

    // Logo dot + brand name
    doc.setFillColor(ar, ag, ab);
    doc.circle(margin + 3, 15, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Disease Prediction System', margin + 9, 18);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 160, 180);
    doc.text('AI-Powered Health Analysis Report', margin + 9, 24.5);

    // Date top-right
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    doc.setFontSize(8);
    doc.setTextColor(130, 140, 160);
    doc.text(`Generated: ${dateStr}`, pageW - margin, 18, { align: 'right' });
    doc.text('Confidential', pageW - margin, 24.5, { align: 'right' });

    let y = 52;

    // ── PATIENT INFO CARD ────────────────────────────────────────────────────
    // Card shadow (faux — lighter rect behind)
    doc.setFillColor(230, 235, 240);
    doc.roundedRect(margin + 0.8, y + 0.8, contentW, 28, 2.5, 2.5, 'F');
    // Card body
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentW, 28, 2.5, 2.5, 'F');
    // Left accent bar
    doc.setFillColor(ar, ag, ab);
    doc.roundedRect(margin, y, 3, 28, 1.5, 1.5, 'F');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 110, 130);
    doc.text('PATIENT INFORMATION', margin + 7, y + 6);

    const col1x = margin + 7;
    const col2x = margin + contentW / 2 + 4;
    const fields = [
      ['Name', u.name || 'Not provided', col1x, y + 13],
      ['Email', u.email || 'Not provided', col1x, y + 20],
      ['Age', u.age ? `${u.age} yrs` : 'Not provided', col2x, y + 13],
      ['Gender', u.gender || 'Not provided', col2x, y + 20],
    ];
    fields.forEach(([label, val, x, fy]) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(130, 140, 160);
      doc.text(label.toUpperCase() + ':', x, fy);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(20, 30, 50);
      doc.text(val, x + 18, fy);
    });

    y += 36;

    // ── DIAGNOSIS CARD ───────────────────────────────────────────────────────
    // Card
    doc.setFillColor(230, 235, 240);
    doc.roundedRect(margin + 0.8, y + 0.8, contentW, 46, 2.5, 2.5, 'F');
    doc.setFillColor(10, 14, 30);
    doc.roundedRect(margin, y, contentW, 46, 2.5, 2.5, 'F');

    // Accent badge top-right
    const badge = urgencyBadge[top.urgency] || 'RESULT';
    doc.setFillColor(ar, ag, ab);
    doc.roundedRect(pageW - margin - 38, y + 5, 38, 7, 1.5, 1.5, 'F');
    doc.setTextColor(10, 14, 30);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(badge, pageW - margin - 19, y + 9.8, { align: 'center' });

    // Disease name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(19);
    doc.setFont('helvetica', 'bold');
    doc.text(top.disease, margin + 6, y + 17);

    // Specialist row
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 160, 185);
    const specLabel = top.specialist === 'None' ? 'No specialist required' : `See: ${top.specialist}`;
    doc.text(specLabel, margin + 6, y + 25);

    // Divider
    doc.setDrawColor(40, 50, 70);
    doc.line(margin + 6, y + 29, pageW - margin - 6, y + 29);

    // Confidence bar
    const barX = margin + 6;
    const barY = y + 34;
    const barW = contentW - 12;
    const filledW = (top.confidence / 100) * barW;

    doc.setFillColor(30, 40, 60);
    doc.roundedRect(barX, barY, barW, 4, 2, 2, 'F');
    doc.setFillColor(ar, ag, ab);
    doc.roundedRect(barX, barY, filledW, 4, 2, 2, 'F');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(ar, ag, ab);
    doc.text(`${top.confidence}% confidence`, barX, barY - 2);

    // Symptom count
    doc.setTextColor(120, 130, 150);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`${data.symptom_count || '-'} of 20 symptoms matched`, barX, barY + 9.5);

    y += 54;

    // ── ALTERNATIVES ─────────────────────────────────────────────────────────
    if (alts.length > 0) {
      y = sectionTitle('Alternative Possibilities', y);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, y, contentW, 6 + alts.length * 11, 2, 2, 'F');
      y += 4;
      alts.forEach((a, i) => {
        const altHex = urgencyHex[a.urgency] || '#4d9fff';
        const [rr, rg, rb] = hex2rgb(altHex);
        const altBarW = (a.confidence / 100) * (contentW - 24);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(20, 30, 50);
        doc.text(a.disease, margin + 5, y + 5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(rr, rg, rb);
        doc.text(`${a.confidence.toFixed(1)}%`, pageW - margin - 5, y + 5, { align: 'right' });
        // mini bar
        doc.setFillColor(220, 225, 235);
        doc.roundedRect(margin + 5, y + 7, contentW - 24, 2.5, 1, 1, 'F');
        doc.setFillColor(rr, rg, rb);
        doc.roundedRect(margin + 5, y + 7, altBarW, 2.5, 1, 1, 'F');
        y += 11;
      });
      y += 6;
    }

    // ── DIET RECOMMENDATION ──────────────────────────────────────────────────
    y = sectionTitle('Diet Recommendation', y);
    doc.setFillColor(248, 250, 252);
    const dietLines = doc.splitTextToSize(top.diet, contentW - 16);
    const dietH = dietLines.length * 5.5 + 10;
    doc.roundedRect(margin, y, contentW, dietH, 2, 2, 'F');
    // fork icon placeholder (coloured dot)
    doc.setFillColor(ar, ag, ab);
    doc.circle(margin + 7, y + dietH / 2, 3, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 50, 70);
    doc.text(dietLines, margin + 14, y + 7);
    y += dietH + 8;

    // ── PRECAUTIONS ──────────────────────────────────────────────────────────
    y = sectionTitle('Precautions to Take', y);
    top.precautions.forEach((p, i) => {
      const pLines = doc.splitTextToSize(p, contentW - 22);
      const pH = pLines.length * 5.5 + 8;
      // alternating row bg
      doc.setFillColor(i % 2 === 0 ? 248 : 241, i % 2 === 0 ? 250 : 245, i % 2 === 0 ? 252 : 248);
      doc.roundedRect(margin, y, contentW, pH, 1.5, 1.5, 'F');
      // numbered circle
      doc.setFillColor(ar, ag, ab);
      doc.circle(margin + 6, y + pH / 2, 3.5, 'F');
      doc.setTextColor(10, 14, 30);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text(`${i + 1}`, margin + 6, y + pH / 2 + 2.5, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(30, 40, 60);
      doc.text(pLines, margin + 14, y + 6);
      y += pH + 3;
    });

    y += 8;

    // ── DISCLAIMER ───────────────────────────────────────────────────────────
    doc.setFillColor(255, 245, 245);
    doc.setDrawColor(220, 60, 60);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, y, contentW, 16, 2, 2, 'FD');
    // red left bar
    doc.setFillColor(200, 40, 40);
    doc.roundedRect(margin, y, 3, 16, 1.5, 1.5, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 30, 30);
    doc.text('MEDICAL DISCLAIMER', margin + 7, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 30, 30);
    doc.text('This report is NOT a medical diagnosis. Always consult a licensed healthcare professional.', margin + 7, y + 12, { maxWidth: contentW - 10 });

    // ── FOOTER ───────────────────────────────────────────────────────────────
    doc.setFillColor(10, 14, 30);
    doc.rect(0, pageH - 12, pageW, 12, 'F');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 110, 135);
    doc.setFont('helvetica', 'normal');
    doc.text('Disease Prediction System  ·  AI Health Analysis · This is NOT a medical diagnosis, Please consult a licensed doctor.', margin, pageH - 5);
    doc.text('Page 1 of 1', pageW - margin, pageH - 5, { align: 'right' });

    doc.save("Prediction_Report.pdf");
  };

  return (
    <div className="res-page">
      <div className="res-orb res-orb1" style={{ background: `${urgencyColor}15` }} />
      <div className="res-orb res-orb2" />

      {/* Header */}
      <header className="res-header">
        <button className="pred-back" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <div className="res-logo">
          <span style={{ color: 'var(--teal)' }}>✦</span> Disease Prediction System
        </div>
        <button className="res-again-btn" onClick={onReset}>
          Check again
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7h10M9 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button className="res-again-btn" onClick={downloadReport}>
          Download Report
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v6M4 6l3 3 3-3M2 12h10"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </header>

      <div className="res-body">

        {/* Low confidence warning */}
        {data.low_confidence && (
          <div className="res-warn fade-up">
            ⚠ Symptoms match multiple conditions. Results shown with lower confidence — please consult a doctor.
          </div>
        )}

        {/* PRIMARY RESULT CARD */}
        <div className="res-primary scale-in" style={{ '--accent': urgencyColor }}>
          <div className="res-primary-top">
            <div className="res-primary-left">
              <div className="res-urgency-badge" style={{ color: urgencyColor, background: URGENCY_BG[top.urgency] }}>
                {URGENCY_LABEL[top.urgency]}
              </div>
              <h1 className="res-disease-name">{top.disease}</h1>
              <p className="res-description">{top.description}</p>

              <div className="res-meta-row">
                <div className="res-meta-item">
                  <span className="res-meta-label">Specialist</span>
                  <span className="res-meta-val">{top.specialist === 'None' ? 'No specialist needed' : top.specialist}</span>
                </div>
                <div className="res-meta-item">
                  <span className="res-meta-label">Symptoms matched</span>
                  <span className="res-meta-val">{data.symptom_count} of 20</span>
                </div>
              </div>
            </div>

            <div className="res-ring-wrap">
              <ConfidenceRing value={top.confidence} color={urgencyColor} />
            </div>
          </div>
        </div>

        {/* ALTERNATIVES */}
        {alts.length > 0 && (
          <div className="res-section fade-up" style={{ animationDelay: '0.15s' }}>
            <h3 className="res-section-title">Alternative possibilities</h3>
            <div className="res-alt-card">
              {alts.map((a, i) => (
                <AltBar
                  key={a.disease}
                  disease={a.disease}
                  confidence={a.confidence}
                  color={URGENCY_COLOR[a.urgency] || '#4d9fff'}
                />
              ))}
            </div>
          </div>
        )}

        {/* DIET ADVICE */}
        <div className="res-section fade-up" style={{ animationDelay: '0.25s' }}>
          <h3 className="res-section-title">Diet recommendation</h3>
          <div className="res-diet-card">
            <div className="res-diet-icon">🥗</div>
            <p className="res-diet-text">{top.diet}</p>
          </div>
        </div>

        {/* PRECAUTIONS */}
        <div className="res-section fade-up" style={{ animationDelay: '0.35s' }}>
          <h3 className="res-section-title">Precautions to take</h3>
          <div className="res-precautions">
            {top.precautions.map((p, i) => (
              <div key={i} className="res-precaution-card">
                <div className="res-precaution-num">{i + 1}</div>
                <p className="res-precaution-text">{p}</p>
              </div>
            ))}
          </div>
        </div>

        {/* DISCLAIMER */}
        <div className="res-disclaimer fade-up" style={{ animationDelay: '0.45s' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M8 5v4M8 10.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          {data.disclaimer}
        </div>

        {/* Check again */}
        <div className="res-cta-wrap fade-up" style={{ animationDelay: '0.5s' }}>
          <button className="res-cta" onClick={onReset}>
            Check again with different symptoms
          </button>
        </div>

      </div>
    </div>
  );
}
