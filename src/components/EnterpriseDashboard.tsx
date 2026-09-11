import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  Flame, 
  TrendingUp, 
  Search, 
  Sparkles,
  TreePine,
  DollarSign,
  Award,
  FileText
} from 'lucide-react';
import { OffsetOrder, ESGCertificateData } from '../types/marketplace';
import { downloadESGCertificate } from '../services/certificateGenerator';

interface EnterpriseDashboardProps {
  orders: OffsetOrder[];
  onNavigateToMarketplace: () => void;
}

export const EnterpriseDashboard: React.FC<EnterpriseDashboardProps> = ({
  orders,
  onNavigateToMarketplace
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('ALL');
  const [downloadingCertId, setDownloadingCertId] = useState<string | null>(null);

  // Total metrics
  const totalTonsRetired = orders.reduce((acc, o) => acc + o.tonsRetired, 0);
  const totalCapitalSpent = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const totalCertificates = orders.length;
  const treesEquiv = Math.round(totalTonsRetired * 5);

  // Unique companies
  const companies = Array.from(new Set(orders.map((o) => o.buyerCompany)));

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.buyerCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.certificateId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.polygonBurnTxHash.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCompany = 
      selectedCompanyFilter === 'ALL' || order.buyerCompany === selectedCompanyFilter;

    return matchesSearch && matchesCompany;
  });

  // Re-generate and download PDF for any ledger item
  const handleDownloadLedgerCertificate = async (order: OffsetOrder) => {
    setDownloadingCertId(order.certificateId);
    try {
      const certData: ESGCertificateData = {
        certificateId: order.certificateId,
        orderId: order.orderId,
        companyName: order.buyerCompany,
        authorizedSignatory: order.signatoryName || 'Authorized Signatory',
        corporateEmail: order.corporateEmail || 'esg@enterprise.com',
        tonsRetired: order.tonsRetired,
        projectName: order.projectName,
        projectRegion: 'Coastal Blue Carbon Reserve, India',
        ecosystemType: 'Mangrove / Tidal Wetland',
        polygonBurnTxHash: order.polygonBurnTxHash,
        polygonTokenId: '124716',
        ipfsDossierCid: 'bafybeicg2kl5mvo7p3x98a2z4g7h3k4e21a7c88b90c1f2e3d4c5',
        issuanceDate: order.retirementDate,
        verificationUrl: `https://amoy.polygonscan.com/tx/${order.polygonBurnTxHash}`,
        environmentalImpact: {
          treesEquivalent: Math.round(order.tonsRetired * 5),
          flightMilesOffset: Math.round(order.tonsRetired * 0.85),
          carsOffRoadDays: Math.round(order.tonsRetired * 2.2)
        }
      };

      await downloadESGCertificate(certData);
    } catch (err) {
      console.error('Failed to download ledger certificate', err);
    } finally {
      setDownloadingCertId(null);
    }
  };

  // Monthly trends
  const monthlyData = [
    { month: 'Apr', tons: 1200 },
    { month: 'May', tons: 2100 },
    { month: 'Jun', tons: 3400 },
    { month: 'Jul', tons: 2800 },
    { month: 'Aug', tons: 4900 },
    { month: 'Sep', tons: totalTonsRetired }
  ];
  const maxMonthlyTons = Math.max(...monthlyData.map((d) => d.tons), 5000);

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00e5ff]/10 border border-[#00e5ff]/30 text-[#00e5ff] text-xs font-bold tracking-widest uppercase mb-2 shadow-[0_0_8px_rgba(0,229,255,0.2)]">
            <BarChart3 className="w-3.5 h-3.5" />
            ENTERPRISE ESG AUDIT & REPORTING
          </div>
          <h1 className="text-3xl font-extrabold text-[#eef2ff]" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            INSTITUTIONAL CARBON RETIREMENT LEDGER
          </h1>
          <p className="text-[#94a3c8] text-xs md:text-sm mt-1">
            Real-time auditable ledger of all on-chain Polygon burns and verified corporate ESG certificates.
          </p>
        </div>

        <button
          onClick={onNavigateToMarketplace}
          className="self-start md:self-auto py-3 px-5 rounded-xl bg-gradient-to-r from-[#00e5ff] to-[#3d7aff] hover:from-[#00c6ff] hover:to-[#3d7aff] text-[#0a0b1e] font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all transform hover:-translate-y-0.5"
        >
          <Flame className="w-4 h-4" />
          Retire More in Marketplace
        </button>
      </div>

      {/* Top Stats Cards (Thetan Arena Marketplace Stat Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="p-6 rounded-2xl bg-[#141538] border border-[rgba(99,102,241,0.2)] hover:border-[#00e5ff] shadow-xl relative overflow-hidden transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#00e5ff]/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-[#94a3c8] text-xs font-semibold uppercase tracking-wider">
            <span>Total CO2e Retired</span>
            <Flame className="w-4 h-4 text-[#00e5ff]" />
          </div>
          <div className="text-3xl font-black text-[#eef2ff] font-mono mt-3">
            {totalTonsRetired.toLocaleString()} <span className="text-xs text-[#00e5ff] font-sans">tCO2e</span>
          </div>
          <div className="text-xs text-[#00e5ff] flex items-center gap-1 mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            +18.4% this quarter
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-6 rounded-2xl bg-[#141538] border border-[rgba(99,102,241,0.2)] hover:border-[#3d7aff] shadow-xl relative overflow-hidden transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#3d7aff]/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-[#94a3c8] text-xs font-semibold uppercase tracking-wider">
            <span>Total Capital Invested</span>
            <DollarSign className="w-4 h-4 text-[#3d7aff]" />
          </div>
          <div className="text-3xl font-black text-[#eef2ff] font-mono mt-3">
            ${totalCapitalSpent.toLocaleString()}
          </div>
          <div className="text-xs text-[#94a3c8] mt-2">
            Average: ${totalTonsRetired > 0 ? (totalCapitalSpent / totalTonsRetired).toFixed(2) : '28.00'} / ton
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-6 rounded-2xl bg-[#141538] border border-[rgba(99,102,241,0.2)] hover:border-[#a855f7] shadow-xl relative overflow-hidden transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#a855f7]/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-[#94a3c8] text-xs font-semibold uppercase tracking-wider">
            <span>Verified Certificates</span>
            <Award className="w-4 h-4 text-[#a855f7]" />
          </div>
          <div className="text-3xl font-black text-[#a855f7] font-mono mt-3">
            {totalCertificates} <span className="text-xs text-[#94a3c8] font-sans font-normal">Records</span>
          </div>
          <div className="text-xs text-[#a855f7] flex items-center gap-1 mt-2">
            <Sparkles className="w-3.5 h-3.5" />
            100% On-Chain Proof on Polygon
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-6 rounded-2xl bg-[#141538] border border-[rgba(99,102,241,0.2)] hover:border-[#39ff14] shadow-xl relative overflow-hidden transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#39ff14]/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-[#94a3c8] text-xs font-semibold uppercase tracking-wider">
            <span>Trees Equivalent Sinks</span>
            <TreePine className="w-4 h-4 text-[#39ff14]" />
          </div>
          <div className="text-3xl font-black text-[#39ff14] font-mono mt-3">
            ~{treesEquiv.toLocaleString()}
          </div>
          <div className="text-xs text-[#94a3c8] mt-2">
            Mangrove and tidal wetland protection
          </div>
        </div>
      </div>

      {/* Analytics Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Offsets Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#101230] border border-[rgba(99,102,241,0.2)] space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-[#eef2ff] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#00e5ff]" />
                Monthly Blue Carbon Retirement Volume (tCO2e)
              </h3>
              <p className="text-xs text-[#94a3c8] mt-0.5">
                Cumulative retirement trajectory across corporate clients
              </p>
            </div>
            <span className="text-xs font-mono text-[#00e5ff] bg-[#00e5ff]/10 px-2 py-0.5 rounded border border-[#00e5ff]/30">
              FY 2026 Live
            </span>
          </div>

          {/* SVG Bar Chart */}
          <div className="pt-4 h-48 flex items-end justify-between gap-4">
            {monthlyData.map((d) => {
              const heightPercent = Math.round((d.tons / maxMonthlyTons) * 100);
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[11px] font-mono text-[#00e5ff] opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.tons.toLocaleString()}t
                  </div>
                  <div className="w-full max-w-[48px] bg-[#0a0b1e] rounded-t-lg overflow-hidden h-full flex items-end border-b border-[rgba(99,102,241,0.2)]">
                    <div
                      className="w-full bg-gradient-to-t from-[#3d7aff] to-[#00e5ff] group-hover:to-[#a855f7] rounded-t-lg transition-all duration-300 shadow-[0_0_12px_rgba(0,229,255,0.3)]"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#94a3c8] font-medium">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ecosystem Portfolio Breakdown */}
        <div className="p-6 rounded-2xl bg-[#101230] border border-[rgba(99,102,241,0.2)] space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#eef2ff]">Ecosystem Offset Sinks</h3>
            <p className="text-xs text-[#94a3c8] mt-0.5">Distribution of credits by habitat</p>
          </div>

          <div className="space-y-3.5 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#94a3c8]">Sundarbans Mangroves</span>
                <span className="font-mono text-[#00e5ff] font-bold">58%</span>
              </div>
              <div className="w-full bg-[#0a0b1e] h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-[#00e5ff] to-[#3d7aff] h-full rounded-full" style={{ width: '58%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#94a3c8]">Bhitarkanika Tidal Wetlands</span>
                <span className="font-mono text-[#a855f7] font-bold">27%</span>
              </div>
              <div className="w-full bg-[#0a0b1e] h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-[#a855f7] to-[#e040fb] h-full rounded-full" style={{ width: '27%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#94a3c8]">Pichavaram & Andaman Seagrass</span>
                <span className="font-mono text-[#39ff14] font-bold">15%</span>
              </div>
              <div className="w-full bg-[#0a0b1e] h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-[#39ff14] to-[#00e5ff] h-full rounded-full" style={{ width: '15%' }} />
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#0a0b1e] rounded-xl border border-[rgba(99,102,241,0.2)] text-xs text-[#94a3c8]">
            <div className="flex items-center gap-1.5 font-semibold text-[#00e5ff] mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Smithsonian CCN Validated
            </div>
            All habitat zones are anchored against soil organic carbon cores from Smithsonian Network.
          </div>
        </div>
      </div>

      {/* Corporate Retirement Ledger Table */}
      <div className="p-6 rounded-2xl bg-[#101230] border border-[rgba(99,102,241,0.2)] space-y-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#eef2ff] flex items-center gap-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              <FileText className="w-4 h-4 text-[#00e5ff]" />
              OFFICIAL CORPORATE PROOF-OF-BURN LEDGER
            </h3>
            <p className="text-xs text-[#94a3c8] mt-0.5">
              Permanently registered ESG compliance certificates on Polygon Amoy
            </p>
          </div>

          {/* Filter and Search */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#94a3c8]" />
              <input
                type="text"
                placeholder="Filter cert ID or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#0a0b1e] border border-[rgba(99,102,241,0.25)] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#eef2ff] placeholder-[#5b6486] focus:outline-none focus:border-[#00e5ff] w-48"
              />
            </div>

            <select
              value={selectedCompanyFilter}
              onChange={(e) => setSelectedCompanyFilter(e.target.value)}
              className="bg-[#0a0b1e] border border-[rgba(99,102,241,0.25)] rounded-lg px-3 py-1.5 text-xs text-[#94a3c8] focus:outline-none focus:border-[#00e5ff]"
            >
              <option value="ALL">All Companies</option>
              {companies.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[rgba(99,102,241,0.2)] text-[#94a3c8] uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Certificate ID</th>
                <th className="py-3 px-4">Corporate Entity</th>
                <th className="py-3 px-4">Origin Project</th>
                <th className="py-3 px-4">Retired CO2e</th>
                <th className="py-3 px-4">Investment</th>
                <th className="py-3 px-4">Polygon Burn Tx</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(99,102,241,0.15)]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#5b6486]">
                    No retirement records found matching query.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-[#141538]/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#00e5ff]">
                      {order.certificateId}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#eef2ff]">
                      <div>{order.buyerCompany}</div>
                      <div className="text-[10px] text-[#94a3c8]">{order.signatoryName}</div>
                    </td>
                    <td className="py-3 px-4 text-[#94a3c8] max-w-[200px] truncate">
                      {order.projectName}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#eef2ff]">
                      {order.tonsRetired.toLocaleString()} <span className="text-[10px] text-[#00e5ff]">t</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#94a3c8]">
                      ${order.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <a
                        href={`https://amoy.polygonscan.com/tx/${order.polygonBurnTxHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-[#94a3c8] hover:text-[#00e5ff] flex items-center gap-1 truncate max-w-[140px]"
                        title={order.polygonBurnTxHash}
                      >
                        {order.polygonBurnTxHash.substring(0, 10)}...{order.polygonBurnTxHash.substring(58)}
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDownloadLedgerCertificate(order)}
                        disabled={downloadingCertId === order.certificateId}
                        className="px-3 py-1.5 rounded-lg bg-[#00e5ff]/10 hover:bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/30 text-[11px] font-bold inline-flex items-center gap-1.5 transition-all shadow-[0_0_8px_rgba(0,229,255,0.2)]"
                      >
                        <Download className="w-3 h-3" />
                        {downloadingCertId === order.certificateId ? 'Downloading...' : 'PDF Cert'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
