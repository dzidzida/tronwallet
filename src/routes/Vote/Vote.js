import React, { Component } from 'react';
import { Affix, AutoComplete } from 'antd';
import styles from './Vote.less';

class Vote extends Component {
  state = {
    votelist: [],
  };

  handleSearch = value => {
    // console.log('Value searched', value);
    return value;
  };

  render() {
    const { votelist } = this.state;
    return (
      <div className={styles.container}>
        <AutoComplete
          dataSource={votelist}
          size="large"
          style={{ width: '100%' }}
          onSearch={this.handleSearch}
          placeholder="Search for address or URL"
        />
        <div className={styles.content}>
          <div className={styles.tableCol}>
            <div className={styles.divTitle}>Candidates</div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Address</th>
                  <th>Votes</th>
                  <th>My Vote</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>
                    27cLJRHL9mb9fvAi4e7vUrArqGXSyafn4eN<br />
                    http://Mercury.org
                  </td>
                  <td>
                    1057886793<br />
                    TRX
                  </td>
                  <td>
                    <input defaultValue={0} type="number" />
                  </td>
                </tr>
                <tr>
                  <td>1</td>
                  <td>
                    27cEZa99jVaDkujPwzZuHYgk... <br />
                    http://Mercury.org
                  </td>
                  <td>
                    1057886793<br />
                    TRX
                  </td>
                  <td>
                    <input defaultValue={0} type="number" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <Affix offsetTop={10} className={styles.voteCol}>
            <div className={styles.divTitle}>Vote</div>
            <div className={styles.voteCard}>
              <p>993762.999998 TRX Remaining</p>
              <span className={styles.progress} />
              <button>Submit Votes</button>
              <p>
                Use your TRX to vote for Super Representatives. For every TRX you hold in your
                account you have one vote to spend. TRX will not be consumed. You can vote as many
                times for the several representatives as you like. The votes are tallied once every
                6 hours and the final election results will be updated at 0:00 AM (0:00) UTC, 6:00
                AM (6:00) UTC, 12:00 PM (12:00) UTC and 6:00 PM (18:00) UTC, and the list of
                SuperRepresentatives will be updated.
              </p>
            </div>
          </Affix>
        </div>
      </div>
    );
  }
}
export default Vote;
