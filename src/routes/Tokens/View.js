import React from 'react';
import styles from './View.less';

const View = () => {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Issuer</th>
          <th className={styles.right}>Total Supply</th>
          <th>Start / End Time</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>OhMyGod</td>
          <td>27d3byPxZXKQWfXX7sJvemJJuv5M65F3vjS</td>
          <td className={styles.right}>100,000</td>
          <td>5/2/2018 5:56 PM</td>
          <td className={styles.center}>
            <button>Participate</button>
          </td>
        </tr>
        <tr>
          <td>OhMyGod</td>
          <td>27d3byPxZXKQWfXX7sJvemJJuv5M65F3vjS</td>
          <td className={styles.right}>100,000</td>
          <td>5/2/2018 5:56 PM</td>
          <td className={styles.center}>
            <button>Participate</button>
          </td>
        </tr>
        <tr>
          <td>OhMyGod</td>
          <td>27d3byPxZXKQWfXX7sJvemJJuv5M65F3vjS</td>
          <td className={styles.right}>100,000</td>
          <td>5/2/2018 5:56 PM</td>
          <td className={styles.center}>
            <button>Participate</button>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default View;
