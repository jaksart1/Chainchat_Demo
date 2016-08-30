var credentials = {}

// If we're running locally, manually populate our credentials
if (!process.env.VCAP_SERVICES) {
	credentials =
		{
			"peers": [
				{
					"discovery_host": "ce3f9204-f032-4f01-ae08-b48fda71a2f7_vp0.us.blockchain.ibm.com",
					"discovery_port": 30303,
					"api_host": "ce3f9204-f032-4f01-ae08-b48fda71a2f7_vp0.us.blockchain.ibm.com",
					"api_port_tls": 443,
					"api_port": 443,
					"type": "peer",
					"network_id": "ce3f9204-f032-4f01-ae08-b48fda71a2f7",
					"container_id": "1d8e83c71e95eb42ffa97d86befd9e4021935fb232f64842c276fd7ef435146f",
					"id": "ce3f9204-f032-4f01-ae08-b48fda71a2f7_vp0",
					"api_url": "http://ce3f9204-f032-4f01-ae08-b48fda71a2f7_vp0.us.blockchain.ibm.com:443"
				},
				{
					"discovery_host": "ce3f9204-f032-4f01-ae08-b48fda71a2f7_vp1.us.blockchain.ibm.com",
					"discovery_port": 30303,
					"api_host": "ce3f9204-f032-4f01-ae08-b48fda71a2f7_vp1.us.blockchain.ibm.com",
					"api_port_tls": 443,
					"api_port": 443,
					"type": "peer",
					"network_id": "ce3f9204-f032-4f01-ae08-b48fda71a2f7",
					"container_id": "afed7f42e9ce6a3206bb3f2ffdfedd1648aba76cf37a3655c80834eb39a3de2c",
					"id": "ce3f9204-f032-4f01-ae08-b48fda71a2f7_vp1",
					"api_url": "http://ce3f9204-f032-4f01-ae08-b48fda71a2f7_vp1.us.blockchain.ibm.com:443"
				},
				{
					"discovery_host": "ce3f9204-f032-4f01-ae08-b48fda71a2f7_vp2.us.blockchain.ibm.com",
					"discovery_port": 30303,
					"api_host": "ce3f9204-f032-4f01-ae08-b48fda71a2f7_vp2.us.blockchain.ibm.com",
					"api_port_tls": 443,
					"api_port": 443,
					"type": "peer",
					"network_id": "ce3f9204-f032-4f01-ae08-b48fda71a2f7",
					"container_id": "692659cecdb6194704e4738be594e00a36a60830d2aea133bfc75a29fdb45a05",
					"id": "ce3f9204-f032-4f01-ae08-b48fda71a2f7_vp2",
					"api_url": "http://ce3f9204-f032-4f01-ae08-b48fda71a2f7_vp2.us.blockchain.ibm.com:443"
				},
				{
					"discovery_host": "ce3f9204-f032-4f01-ae08-b48fda71a2f7_vp3.us.blockchain.ibm.com",
					"discovery_port": 30303,
					"api_host": "ce3f9204-f032-4f01-ae08-b48fda71a2f7_vp3.us.blockchain.ibm.com",
					"api_port_tls": 443,
					"api_port": 443,
					"type": "peer",
					"network_id": "ce3f9204-f032-4f01-ae08-b48fda71a2f7",
					"container_id": "12a289856c1c4a320c33ca1edc4b7e1ca91b9cd1edf7201fa79e9e4b1305686e",
					"id": "ce3f9204-f032-4f01-ae08-b48fda71a2f7_vp3",
					"api_url": "http://ce3f9204-f032-4f01-ae08-b48fda71a2f7_vp3.us.blockchain.ibm.com:443"
				}
			],
			"ca": {
				"ce3f9204-f032-4f01-ae08-b48fda71a2f7_ca": {
					"url": "ce3f9204-f032-4f01-ae08-b48fda71a2f7_ca.us.blockchain.ibm.com:30303",
					"discovery_host": "ce3f9204-f032-4f01-ae08-b48fda71a2f7_ca.us.blockchain.ibm.com",
					"discovery_port": 30303,
					"api_host": "ce3f9204-f032-4f01-ae08-b48fda71a2f7_ca.us.blockchain.ibm.com",
					"api_port_tls": 30303,
					"api_port": 443,
					"type": "ca",
					"network_id": "ce3f9204-f032-4f01-ae08-b48fda71a2f7",
					"container_id": "254b809820489166e9897b736d21f441a84d55722a7afa39844256e68b259d6e"
				}
			},
			"users": [
				{
					"username": "admin",
					"secret": "58af6fbdc5",
					"enrollId": "admin",
					"enrollSecret": "58af6fbdc5"
				},
				{
					"username": "WebAppAdmin",
					"secret": "9a3702d674",
					"enrollId": "WebAppAdmin",
					"enrollSecret": "9a3702d674"
				},
				{
					"username": "user_type1_440b254cbb",
					"secret": "da9841ea57",
					"enrollId": "user_type1_440b254cbb",
					"enrollSecret": "da9841ea57"
				},
				{
					"username": "user_type1_2a3711e800",
					"secret": "3978690cd6",
					"enrollId": "user_type1_2a3711e800",
					"enrollSecret": "3978690cd6"
				},
				{
					"username": "user_type1_15390baebb",
					"secret": "333f71f9b0",
					"enrollId": "user_type1_15390baebb",
					"enrollSecret": "333f71f9b0"
				},
				{
					"username": "user_type1_d5dcf49c0c",
					"secret": "48367f11fa",
					"enrollId": "user_type1_d5dcf49c0c",
					"enrollSecret": "48367f11fa"
				},
				{
					"username": "user_type1_955cf62e3b",
					"secret": "2506cf67c2",
					"enrollId": "user_type1_955cf62e3b",
					"enrollSecret": "2506cf67c2"
				},
				{
					"username": "user_type2_beba39917e",
					"secret": "659dda753d",
					"enrollId": "user_type2_beba39917e",
					"enrollSecret": "659dda753d"
				},
				{
					"username": "user_type2_7c48efb70f",
					"secret": "8db264855b",
					"enrollId": "user_type2_7c48efb70f",
					"enrollSecret": "8db264855b"
				},
				{
					"username": "user_type2_205e39330c",
					"secret": "3eede0d4d5",
					"enrollId": "user_type2_205e39330c",
					"enrollSecret": "3eede0d4d5"
				},
				{
					"username": "user_type2_50f0ae4204",
					"secret": "5dfc9a659c",
					"enrollId": "user_type2_50f0ae4204",
					"enrollSecret": "5dfc9a659c"
				},
				{
					"username": "user_type2_7efa8f5bda",
					"secret": "45fdcfc189",
					"enrollId": "user_type2_7efa8f5bda",
					"enrollSecret": "45fdcfc189"
				},
				{
					"username": "user_type4_87efc05903",
					"secret": "d00584dc35",
					"enrollId": "user_type4_87efc05903",
					"enrollSecret": "d00584dc35"
				},
				{
					"username": "user_type4_80594232c3",
					"secret": "9f8f85cf80",
					"enrollId": "user_type4_80594232c3",
					"enrollSecret": "9f8f85cf80"
				},
				{
					"username": "user_type4_cd3eaa1938",
					"secret": "4c23aa0bef",
					"enrollId": "user_type4_cd3eaa1938",
					"enrollSecret": "4c23aa0bef"
				},
				{
					"username": "user_type4_eb8699f7cf",
					"secret": "05ed13920b",
					"enrollId": "user_type4_eb8699f7cf",
					"enrollSecret": "05ed13920b"
				},
				{
					"username": "user_type4_e6b3ab0cf0",
					"secret": "d157d32f2a",
					"enrollId": "user_type4_e6b3ab0cf0",
					"enrollSecret": "d157d32f2a"
				},
				{
					"username": "user_type8_825dc8fc14",
					"secret": "5d9ca6f5a5",
					"enrollId": "user_type8_825dc8fc14",
					"enrollSecret": "5d9ca6f5a5"
				},
				{
					"username": "user_type8_f8fbd06398",
					"secret": "3d86465122",
					"enrollId": "user_type8_f8fbd06398",
					"enrollSecret": "3d86465122"
				},
				{
					"username": "user_type8_62b1a44821",
					"secret": "f123d61b55",
					"enrollId": "user_type8_62b1a44821",
					"enrollSecret": "f123d61b55"
				},
				{
					"username": "user_type8_8384eff6f8",
					"secret": "4ce2a808e3",
					"enrollId": "user_type8_8384eff6f8",
					"enrollSecret": "4ce2a808e3"
				},
				{
					"username": "user_type8_7308580d70",
					"secret": "9a939eb1c3",
					"enrollId": "user_type8_7308580d70",
					"enrollSecret": "9a939eb1c3"
				}
			]
		}
}
// Otherwise, get them from Bluemix
else {
	var peers, users, ca;
	// credentials = process.env.VCAP_SERVICES.credentials;
	var servicesObject = JSON.parse(process.env.VCAP_SERVICES);
    for (var i in servicesObject) {
        if (i.indexOf('ibm-blockchain-5-prod') >= 0) {											// looks close enough (can be suffixed dev, prod, or staging)
            if (servicesObject[i][0].credentials.error) {
                console.log('!\n!\n! Error from Bluemix: \n', servicesObject[i][0].credentials.error, '!\n!\n');
                peers = null;
                users = null;
                process.error = {
                    type: 'network',
                    msg: "Due to overwhelming demand the IBM Blockchain Network service is at maximum capacity.  Please try recreating this service at a later date."
                };
            }
            if (servicesObject[i][0].credentials && servicesObject[i][0].credentials.peers) {
                console.log('overwritting peers, loading from a vcap service: ', i);
                peers = servicesObject[i][0].credentials.peers;
				peerURLs = [];
                peerHosts = [];
                for (var j in peers) {
                    peerURLs.push("grpcs://" + peers[j].discovery_host + ":" + peers[j].discovery_port);
                    peerHosts.push("" + peers[j].discovery_host);
                }
                if (servicesObject[i][0].credentials.ca) {
                    console.log('overwritting ca, loading from a vcap service: ', i);
                    ca = servicesObject[i][0].credentials.ca;
                    for (var z in ca) {
                        caURL = "grpcs://" + ca[z].discovery_host + ":" + ca[z].discovery_port;
                    }
                    if (servicesObject[i][0].credentials.users) {
                        console.log('overwritting users, loading from a vcap service: ', i);
                        users = servicesObject[i][0].credentials.users;
                        //TODO extract registrar from users once user list has been updated to new SDK
                    }
                    else users = null;													//no security	
                }
                else ca = null;
                break;
            }
        }
		if (i.indexOf('cloudantNoSQLDB') >= 0) {
			if(servicesObject[i][0].credentials) {
				console.log('loading cloudant credintials from vcap services');
				cloudant_creds = servicesObject[i][0].credentials;
			}
		}											// looks close enough (can be suffixed dev, prod, or staging)

		}
		credentials.dbcreds = cloudant_creds;
		credentials.peerURLs = peerURLs;
		credentials.caURL = caURL;
		credentials.peers = peers;
		credentials.ca = ca;
		credentials.users = users;
	}

	exports.credentials = credentials;