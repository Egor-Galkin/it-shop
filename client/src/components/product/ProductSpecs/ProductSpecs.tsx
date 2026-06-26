import styles from './ProductSpecs.module.scss';

interface ProductSpecsProps {
  specs: any[];
}

export function ProductSpecs({ specs }: ProductSpecsProps) {
  return (
    <div className={styles.specsWrap}>
      <h3 className={styles.specsTitle}>Характеристики</h3>
      <div className={styles.specsScroll}>
        {specs.length > 0 ? (
          <table className={styles.specsTable}>
            <tbody>
              {specs.map((info: any) => (
                <tr key={info.id}>
                  <td className={styles.specTitle}>{info.title}</td>
                  <td className={styles.specValue}>{info.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className={styles.empty}>Характеристики не указаны</p>}
      </div>
    </div>
  );
}