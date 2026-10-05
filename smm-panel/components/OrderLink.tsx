/** Customer-supplied order link: clickable only when it's an http(s) URL. */
export function OrderLink({ link }: { link: string }) {
  if (!/^https?:\/\//i.test(link)) return <span title={link}>{link}</span>;
  return (
    <a href={link} target="_blank" rel="noreferrer noopener" title={link} className="break">
      {link}
    </a>
  );
}
