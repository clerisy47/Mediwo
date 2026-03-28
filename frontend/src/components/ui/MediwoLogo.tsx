// import logo from "@/assets/mediwo-logo.png";
import logo from "../../assets/mediwo-logo.png";
interface MediwoLogoProps {
  compact?: boolean;
}

export function MediwoLogo({ compact = false }: MediwoLogoProps) {
  return (
    <span className="mediwo-logo" aria-label="Mediwo">
      <span className="mediwo-logo" aria-label="Mediwo">
        <img
          src={logo}
          alt="Mediwo logo"
          className="mediwo-logo-mark"
        />
      </span>

      {/* <img src={logo} alt="Mediwo logo" className="mediwo-logo-mark" /> */}

      {!compact && (
        <span className="mediwo-logo-wordmark">
          <span>MEDI</span>
          <span>WO</span>
        </span>
      )}
    </span>
  );
}
