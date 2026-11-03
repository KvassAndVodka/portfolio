/** The CDO stamp shared by the hero postcard and the contact card (styles: .postcard-stamp). */
export default function PostcardStamp() {
  return (
    <div className="postcard-stamp" aria-hidden="true">
      <div className="postcard-stamp-face">
        <span className="postcard-stamp-top">
          <span>Pilipinas</span>
          <span>2026</span>
        </span>
        <svg className="postcard-stamp-art" viewBox="0 0 64 40">
          <ellipse cx="32" cy="29" rx="28" ry="9" />
          <ellipse cx="31" cy="27.5" rx="19" ry="6" />
          <ellipse cx="30" cy="26.5" rx="10" ry="3.2" />
          <path className="postcard-stamp-pin" d="M30 25s6-6.1 6-10.4a6 6 0 0 0-12 0C24 18.9 30 25 30 25z" />
          <circle cx="30" cy="14.6" r="2" />
        </svg>
        <strong>CDO</strong>
      </div>
    </div>
  );
}
