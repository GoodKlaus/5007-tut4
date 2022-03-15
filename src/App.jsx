const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

function jsonDateReviver(key, value) {
  if (dateRegex.test(value)) return new Date(value);
  return value;
}
function validate(name, no) {
  var reg_name = /^[a-z ,.'-]+$/i
  var reg_phone = /^\d{8}$/

  if(!reg_name.test(name)){
      alert("Invalid name! Please enter again.");
      return false;
  } else if(!reg_phone.test(no)){
      alert("Invalid phone number! Please enter your Singapore 8-digit phone number.");
      return false;
  }

  return true;
}

function TravellerRow(props) {
  const record = props.record;
  var today = record.timestamp;
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date+' '+time;
  return (
    <tr>
      <td>{record.id}</td>
      <td>{record.name}</td>
      <td>{record.phone}</td>
      <td>{dateTime}</td>
    </tr>
  );
}

function DisplayTraveller(props) {
  const recordRows = props.records.map(record =>
    <TravellerRow key={record.id} record={record} />
  );

  return (
    <table className="bordered-table">
       <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Phone Number</th>
          <th>Timestamp</th>
        </tr>
      </thead>
      <tbody>
        {recordRows}
      </tbody>
    </table>
  );
}

class DeleteTraveller extends React.Component {
  constructor() {
    super();
    this.handleSubmit_del = this.handleSubmit_del.bind(this);
  }

  handleSubmit_del(e) {
    e.preventDefault();
    const form = document.forms.recordDel;
    const record = {
      name: form.name.value, phone: form.phone.value,
    }
    this.props.deleteRecord(record);
    form.name.value = ""; 
    form.phone.value = "";
  }

  render() {
    return (
      <form name="recordDel" onSubmit={this.handleSubmit_del}>
        <input type="text" name="name" placeholder="Name to Delete" />
        <input type="text" name="phone" placeholder="Phone Number to Delete" />
        <button>Delete</button>
      </form>
    );
  }
}

class AddTraveller extends React.Component {
  constructor() {
    super();
    this.handleSubmit_add = this.handleSubmit_add.bind(this);
  }

  handleSubmit_add(e) {
    e.preventDefault();
    const form = document.forms.recordAdd;
    const record = {
      name: form.name.value, phone: form.phone.value,
    }

    if(this.props.records.length < 25) {
      if(validate(record.name, record.phone)){
        this.props.createRecord(record);
      }
    }
    else {
      alert("Sorry, there are no seats available for reservation!");
    }
    
    form.name.value = ""; 
    form.phone.value = "";
  }

  render() {
    return (
      <form name="recordAdd" onSubmit={this.handleSubmit_add}>
        <input type="text" name="name" placeholder="Name" />
        <input type="text" name="phone" placeholder="Phone Number" />
        <button>Add</button>
      </form>
    );
  }
}

class BlackList extends React.Component {
  constructor() {
    super();
    this.handleSubmit_bl = this.handleSubmit_bl.bind(this);
  }

  handleSubmit_bl(e) {
    e.preventDefault();
    const form = document.forms.blackListAdd;
    const name_bl = form.name.value;
    const phone_bl = form.phone.value;
    if (validate(name_bl, phone_bl)) {
      this.props.createBlackList(name_bl, phone_bl);
    }
    form.name.value = "";
    form.phone.value = "";
  }

  render() {
    return (
      <form name="blackListAdd" onSubmit={this.handleSubmit_bl}>
        <input type="text" name="name" placeholder="Name for Blacklisting" />
        <input type="text" name="phone" placeholder="Phone for Blacklisting" />
        <button>Add</button>
      </form>
    );
  }
}

function DisplayFreeSeats(props) {
  const number = props.records.length;
  return (
    <div id="free"><h2>Number of Available Seats: {25-number}</h2></div>
  );
}

class DrawSeat extends React.Component {
  constructor() {
    super();
  }

  render() {
    let tempSeat = new Array(25).fill(0);
    if(this.props.records.length != 0){
      tempSeat.fill(1, 0, this.props.records.length);
    }

    return(
      <div>
      <div className="container">
        <h2>Available Seating Plan</h2>
        <table className="grid">
          <tbody>
              <tr>
                { tempSeat.map( row =>
                  <td className={row == 1 ? 'reserved': 'available'}
                  > </td>) }
              </tr>
          </tbody>
        </table>
      </div>
      <div id="container2">
        <div id="example_a" className="cell"></div><div className="cell">Available</div>
        <div id="example_r" className="cell"></div><div className="cell">Reserved</div>
      </div>
      </div>
    );
  }
}

async function graphQLFetch(query, variables = {}) {
  try {
    const response = await fetch('/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ query, variables })
    });
    const body = await response.text();
    const result = JSON.parse(body, jsonDateReviver);

    if (result.errors) {
      const error = result.errors[0];
      alert(error.message);
      if (error.extensions.code == 'BAD_USER_INPUT') {
        const details = error.extensions.exception.errors.join('\n ');
      }
    }
    return result.data;
  } catch (e) {
    console.log(e.message);
  }
}

class DisplayHomepage extends React.Component {
  constructor() {
    super();
    this.state = {records:[], add: false, delete: false, display: false, black: false};
    this.createRecord = this.createRecord.bind(this);
    this.deleteRecord = this.deleteRecord.bind(this);
    this.createBlackList = this.createBlackList.bind(this);
    this.hide = this.hide.bind(this);
    this.showAdd = this.showAdd.bind(this);
    this.showDel = this.showDel.bind(this);
    this.showDis = this.showDis.bind(this);
    this.showBlack = this.showBlack.bind(this);

  }

  componentDidMount() {
    this.loadData();
  }

  async loadData() {
    const query = `query {
      recordList {
        id name phone timestamp
      }
    }`;

    const data = await graphQLFetch(query);
    if (data) {
      this.setState({ records: data.recordList });
    }
  }

  async createRecord(record) {
    const query = `mutation recordAdd($record: RecordInputs!) {
      recordAdd(record: $record) {
        id
      }
    }`;

    const data = await graphQLFetch(query, { record });
    if (data) {
      this.loadData();
    }
    
  }

  async deleteRecord(record_to_delete) {
    const query = `mutation recordDelete($record_to_delete: RecordInputs!) {
      recordDelete(record: $record_to_delete) 
    }`;

    const data = await graphQLFetch(query, { record_to_delete });
    if (data) {
      this.loadData();
    }
  }

  async createBlackList(name, phone) {
    const query = `mutation blAdd($name: String!, $phone: String!) {
      createBlackList(name: $name, phone: $phone)
    }`;

    const data = await graphQLFetch(query, { name, phone });
  }

  hide() {
    this.setState({add: false, delete: false, display: false, black: false});
  }

  showAdd() {
    this.setState({add: true, delete: false, display: false, black: false});
  }

  showDel() {
    this.setState({add: false, delete: true, display: false, black: false});
  }

  showDis() {
    this.setState({add: false, delete: false, display: true, black: false});
  }

  showBlack() {
    this.setState({add: false, delete: false, display: false, black: true});
  }

  render() {
    return (
      <React.Fragment>
        <h1>Welcome to Singapore-Thailand High-Speed Railway Reservation System</h1>
        <hr />
        <div>
        <ul id="nav">
          <li><a onClick={this.hide}>Home</a></li>
          <li><a onClick={this.showAdd}>Add Traveller</a></li>
          <li><a onClick={this.showDel}>Delete Traveller</a></li>
          <li><a onClick={this.showDis}>Display Traveller</a></li>
          <li><a onClick={this.showBlack}>Add to Blacklist</a></li>
        </ul>
        </div>
        <hr />
        {this.state.add && (<AddTraveller createRecord={this.createRecord} records={this.state.records}/>)}
        {this.state.delete && (<DeleteTraveller deleteRecord={this.deleteRecord}/>)}
        {this.state.display && (<DisplayTraveller records={this.state.records}/>)}
        {this.state.black && (<BlackList createBlackList={this.createBlackList}/>)}
        <hr />
        <DrawSeat records={this.state.records}/>
        <DisplayFreeSeats records={this.state.records} />
      </React.Fragment>
    );
  }
}

const element = <DisplayHomepage />;

ReactDOM.render(element, document.getElementById('contents'));
