var IotdmClient = require('./iotdm_client');
var TsdbDataClient = require('./node_modules/bce-sdk-js/src/tsdb_data_client');

const METRIC = 'yicai';
const PRTField = 'prt';
const PAPField = 'pap';

exports.handler = (event, context, callback) => {

	const baseConfig = {
		credentials: {
			ak: "<your access key>",  
			sk: "<your secret key>" 
		}
	};
	const tsdbConfig = {
		...baseConfig,
		endpoint: "http://<your_tsdb_name>.tsdb.iot.<bj or gz>.baidubce.com" 
	};
	const iotdmConfig = {
		...baseConfig,
		endpoint: "http://iotdm.<bj or gz>.baidubce.com"
	};
	let tsdbClient = new TsdbDataClient(tsdbConfig);
	let iotdmClient = new IotdmClient(iotdmConfig);

	updateRatio(event, iotdmClient, callback);
	updatePap(event, tsdbClient, callback);
	callback(null, '{"result": "ok"}');
};

function calculateAndWritePap(ratio, body, tsdbClient, callback) {
	const values = body.results[0].groups[0].values;
	var index = 1;
	const len = values.length;
	let lastElem = values[0];
	const datapoints = [];
	for (; index < len; index++) {
		let currentElem = values[index];
		let realPtr = currentElem[1] - lastElem[1];
		let pap = realPtr * ratio;
		let datapoint = {
			metric: METRIC,
			field: PAPField,
			tags: {
				deviceName: currentElem[2],
				huhao: currentElem[3],
				bianyaqi: currentElem[4]
			},
			timestamp: currentElem[0],
			value: pap
		};
		datapoints.push(datapoint);
		lastElem = currentElem;
	}

	tsdbClient.writeDatapoints(datapoints)
		.then(response => console.log("Update pap Success."))
		.catch(callback);
}

function updatePap(event, tsdbClient, callback) {
	let extractInfo = [
		{
			metric: METRIC,
			field: PRTField,
			tags: [
				"deviceName",
				"huhao",
				"bianyaqi"
			],
			filters: {
				start: event.from,
				end: event.to,
				tags: {
					deviceName: [
						event.clientid
					]
				}
			}
		}
	];
	tsdbClient.getDatapoints(extractInfo)
		.then(response => calculateAndWritePap(event.ratio, response.body, tsdbClient, callback))
		.catch(callback);
}

function updateRatio(event, iotdmClient, callback) {
	const body = {
		device: {
			reported: {
				ratio: event.ratio
			}
		}
	};
	iotdmClient.updateProfile(event.clientid, body)
		.then(response => console.log("Update Ratio Success."))
		.catch(callback);
}

// function test() {
// 	const event = {
// 		clientid: "99960001",
// 		ratio: 400,
// 		from: 1525104000000,
// 		to: 1525190340000
// 	};

// 	const baseConfig = {
// 		credentials: {
		// 	ak: "<your access key>",  
		// 	sk: "<your secret key>" 
		// }
// 	};
// 	const tsdbConfig = {
// 		...baseConfig,
// 		endpoint: "http://<your_tsdb_name>.tsdb.iot.<bj or gz>.baidubce.com"
// 	};
// 	const iotdmConfig = {
// 		...baseConfig,
// 		endpoint: "http://iotdm.<bj or gz>.baidubce.com"
// 	};
// 	let tsdbClient = new TsdbDataClient(tsdbConfig);
// 	let iotdmClient = new IotdmClient(iotdmConfig);

// 	updateRatio(event, iotdmClient);
// 	updatePap(event, tsdbClient);
// }

// test();