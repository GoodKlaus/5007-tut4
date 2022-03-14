const initialRecord = [];

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
  return (
    <tr>
      <td>{record.id}</td>
      <td>{record.name}</td>
      <td>{record.phone}</td>
      <td>{record.timestamp}</td>
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
        <input type="text" name="name" placeholder="Name" />
        <input type="text" name="phone" placeholder="Phone Number" />
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

class DisplayHomepage extends React.Component {
  constructor() {
    super();
    this.state = {records:[], add: false, delete: false, display: false, clickme: false};
    this.createRecord = this.createRecord.bind(this);
    this.deleteRecord = this.deleteRecord.bind(this);
    this.hide = this.hide.bind(this);
    this.showAdd = this.showAdd.bind(this);
    this.showDel = this.showDel.bind(this);
    this.showDis = this.showDis.bind(this);

  }

  componentDidMount() {
    this.loadData();
  }

  loadData() {
    setTimeout(() => {
      this.setState({records: initialRecord});
    }, 500);
  }

  createRecord(record) {
    record.id = this.state.records.length + 1;
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;
    record.timestamp = dateTime;
    const newRecordList = this.state.records.slice();

    let find = false;
    for (let i=0; i<newRecordList.length; i++) {
      if(newRecordList[i].name == record.name && newRecordList[i].phone == record.phone) {
        alert("Sorry, there is a booking under this name!");
        find = true;
        break;
      }
    }
    if(!find) {
      newRecordList.push(record);
      this.setState({records: newRecordList});
      alert("You have successfully made your reservation!");
    }
    
  }

  deleteRecord(record_to_delete) {
    let newRecordList = this.state.records.slice();
    let target_ind = 0;
    let find = false;
    for (let i=0; i<newRecordList.length; i++) {
      if(newRecordList[i].name == record_to_delete.name && newRecordList[i].phone == record_to_delete.phone) {
        target_ind = i;
        find = true;
        break;
      }
    }
    if(find) {
      newRecordList.splice(target_ind, 1);
      for(let i=target_ind; i<newRecordList.length; i++) {
        newRecordList[i].id = i+1;
      }
      this.setState({records: newRecordList});
      alert("You have successfully canceled your booking!");
    }
    else {
      alert("Sorry, you don't have a booking yet!");
    }
    
  }

  hide() {
    this.setState({add: false, delete: false, display: false});
  }

  showAdd() {
    this.setState({add: true, delete: false, display: false});
  }

  showDel() {
    this.setState({add: false, delete: true, display: false});
  }

  showDis() {
    this.setState({add: false, delete: false, display: true});
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
        </ul>
        </div>
        <hr />
        {this.state.add && (<AddTraveller createRecord={this.createRecord} records={this.state.records}/>)}
        {this.state.delete && (<DeleteTraveller deleteRecord={this.deleteRecord}/>)}
        {this.state.display && (<DisplayTraveller records={this.state.records}/>)}
        <hr />
        <DrawSeat records={this.state.records}/>
        <DisplayFreeSeats records={this.state.records} />
      </React.Fragment>
    );
  }
}

const element = <DisplayHomepage />;

ReactDOM.render(element, document.getElementById('contents'));
