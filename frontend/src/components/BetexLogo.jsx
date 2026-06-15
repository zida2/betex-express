/**
 * BETEX EXPRESS Logo Component
 * Professional black, white and red logo
 */

const BetexLogo = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  return (
    <svg
      viewBox="0 0 200 200"
      className={sizes[size]}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background Circle */}
      <circle cx="100" cy="100" r="95" fill="#ffffff" stroke="#000000" strokeWidth="2" />

      {/* Main Text - BETEX */}
      <text
        x="100"
        y="85"
        fontSize="48"
        fontWeight="900"
        fontFamily="Arial, sans-serif"
        textAnchor="middle"
        fill="#000000"
        letterSpacing="2"
      >
        BETEX
      </text>

      {/* Red Accent Bar */}
      <rect x="35" y="95" width="130" height="8" fill="#dc2626" />

      {/* Subtext - EXPRESS */}
      <text
        x="100"
        y="135"
        fontSize="22"
        fontWeight="700"
        fontFamily="Arial, sans-serif"
        textAnchor="middle"
        fill="#000000"
        letterSpacing="1"
      >
        EXPRESS
      </text>

      {/* Delivery Icon - Simple truck silhouette */}
      <g transform="translate(155, 60)">
        {/* Truck body */}
        <rect x="0" y="8" width="20" height="12" fill="#dc2626" rx="2" />
        {/* Truck cabin */}
        <rect x="-8" y="10" width="8" height="10" fill="#000000" rx="1" />
        {/* Wheels */}
        <circle cx="3" cy="22" r="3" fill="#000000" />
        <circle cx="17" cy="22" r="3" fill="#000000" />
      </g>
    </svg>
  );
};

export default BetexLogo;
