import { SVGAttributes } from 'react'

const Restore = (props: SVGAttributes<SVGSVGElement>): JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="ionicon"
    viewBox="0 0 512 512"
    {...props}
  >
    <title>{'Arrow Undo'}</title>
    <path
      d="M240 424v-96c116.4 0 159.39 33.76 208 96 0-119.23-39.57-240-208-240V88L64 256z"
      fill="none"
      stroke={props.stroke}
      strokeLinejoin="round"
      strokeWidth={32}
    />
  </svg>
)

export default Restore
