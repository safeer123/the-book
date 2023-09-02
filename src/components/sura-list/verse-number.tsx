interface Props {
  number: string;
}

const VerseNumber = ({number}: Props) => {

  return (
  <svg viewBox="0 -400 1250 1625">
    <defs>
     <pattern id="Checkerboard" height="2" width="2" patternUnits="userSpaceOnUse" patternTransform="translate(0,0) scale(20,20)">
      <rect height="2" width="2" y="0" x="0" fill="#53ee86"/>
      <rect height="1" width="1" y="0" x="0" fill="#19c853"/>
      <rect height="1" width="1" y="1" x="1" fill="#19c853"/>
     </pattern>
    </defs>
    <circle cy="421" cx="625" r="605" fill="url(#Checkerboard)"/>
    <circle cy="421" cx="625" r="480" fill="#cad3d0"/>
    <g id="header">
     <path d="m1006.2,46.902c96.075,45.999,160.74,23.972,201.66-30.111-83.3-13.413-157.3-96.153-229.57-148.02-157.22-112.81-249.67-57.8-353.51-236.32-103.83,178.49-196.28,123.48-353.5,236.29-72.29,51.864-146.26,134.6-229.5,148.02,40.928,54.082,105.59,76.11,201.66,30.11,107.34,116.17,142.73-192.06,381.34,10.364,238.62-202.39,274.01,105.84,381.38-10.33z" stroke="#000" stroke-width="30" fill="#966e36"/>
     <circle d="m 694,-127 c 0,38.107648 -30.89235,69 -69,69 -38.10765,0 -69,-30.892352 -69,-69 0,-38.10765 30.89235,-69 69,-69 38.10765,0 69,30.89235 69,69 z" cy="-127" cx="625" r="69" fill="#000"/>
     <path id="repu" strokeWidth="43" stroke="#000" strokeLinecap="round" d="M466.92-110.36c-75.47,27.435-114,46.932-165.42,83.529"/>
     <use href="#repu" transform="translate(1248,0) scale(-1,1)"/>
    </g>
    <use href="#header" transform="translate(0,825) scale(1,-1)"/>
    <text x="625" y="421" color="black" dominantBaseline="middle" textAnchor="middle" fontSize={420}>{number}</text>
   </svg>
  );
};

export default VerseNumber;
