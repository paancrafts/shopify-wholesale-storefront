export default function roundPriceToString(props) {
  const priceNumber = Number(Math.round(props.value+'e'+props.decimals)+'e-'+props.decimals);
  const priceToString = priceNumber.toString().slice(0, -1);
  return priceToString;
}