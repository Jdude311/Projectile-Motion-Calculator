var points;
function calculateTrajectory(output=true, c_d = document.forms[0].c_d.value * 1,) {
	console.log(c_d)
	var rho = document.forms[0].rho.value * 1;
	var r = document.forms[0].r.value * 1;
	var A = Math.PI * r ** 2;
	var a = document.forms[0].alpha.value * 1;
	var m = document.forms[0].m.value * 1;
	var g = document.forms[0].g.value * 1;
	var v_0 = document.forms[0].v_0.value * 1;
	//var omega = document.forms[0].omega.value * 1;
	//var viscosity = document.forms[0].viscosity.value * 1;

	var t_max = document.forms[0].t_max.value * 1;
	var step = document.forms[0].step.value * 1;

	var x = 0;
	var y = document.forms[0].y0.value * 1;
	var v_x = v_0 * Math.cos(a * Math.PI / 180);
	var v_y = v_0 * Math.sin(a * Math.PI / 180);

	var mu = () => { return (c_d * rho * A) / (2 * m) };
	//var F_m = () => { return (omega * v) * (4 * Math.PI * rho * (r ** 3)) / 3 };
	//var torque = () => { return (8 * Math.PI * viscosity * (r ** 3) * omega) };
	//var moment_of_inertia = () => { return (2 / 3) * m * (r ** 2) }; // only valid for a shell--use 2/5 if sphere

	var v = Math.sqrt(v_x ** 2 + v_y ** 2);
	var dv_x = (t) => {
		return t * ( // t * acceleration
			(-mu() * v_x * v)// +
		//	((F_m() * Math.cos(Math.atan2(v_x, v_y))) / m)
		)
	};
	var dv_y = (t) => {
		return t * ( // t * acceleration
			-g +
			(-mu() * v_y * v)// +
			//((F_m() * Math.sin(Math.atan2(v_x, v_y))) / m) // was atan2(-v_x, v_y)
		)
	};
	var dx = (t) => { v_x += dv_x(t); return v_x * t / 2; };
	var dy = (t) => { v_y += dv_y(t); return v_y * t / 2; };
	//var d_omega = (t) => { return t * -(torque() / moment_of_inertia()) };


	var max_x = x;
	var min_x = x;
	var max_y = y;
	var min_y = y;
	var max_v = v;
	var min_v = v;

	points = [{ x, y, t, v }];
	var dt = step /*/v*/;
	var t = 0;
	//while ((y >= 0 || dy(dt) >= 0 || t < 2) || (t < t_max && (t_max > 0))) {
	while (y >= 0) {
		dt = step;
		v = Math.sqrt(v_x ** 2 + v_y ** 2);
		t += dt;
		x += dx(dt);
		y += dy(dt);
		//omega += d_omega(dt);
		//if (Math.abs(omega) < 10 ** -10) omega = 0;
		points.push({ x: x, y: y, v: v, t: t });

		// Update max and min values
		max_x = Math.max(x, max_x);
		min_x = Math.min(x, min_x);
		max_y = Math.max(y, max_y);
		min_y = Math.min(y, min_y);
		max_v = Math.max(v, max_v);
		min_v = Math.min(v, min_v);
	}

	// Now graph it
	document.getElementById('output').innerHTML = "<table id='results'></table> <canvas id='graph'></canvas><br><br><br><br>";
	var ctx = document.getElementById('graph');

	var max = Math.max(max_x, max_y);
	var min = Math.min(min_x, min_y);
	max += Math.abs(0.05 * max);
	min -= Math.abs(0.05 * min);

	var point_colors = [];
	for (let i = 0; i < points.length; i++) {
		let h = ((points[i].v/*-min_v*/) / max_v) * 240 + 120;
		let s = 1;
		let l = 0.5;
		const k = n => (n + h / 30) % 12;
		const a = s * Math.min(l, 1 - l);
		const f = n =>
			Math.ceil(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))))).toString(16).padStart(2, "0");
		point_colors.push("#" + f(0) + f(8) + f(4))
		//point_colors.push("#" + Math.ceil(255*f(0)).toString(16) + Math.ceil(255*f(8)).toString(16) + Math.ceil(255*f(4)).toString(16) + "ff")
		//return [255 * f(0), 255 * f(8), 255 * f(4)];
	}

	if (output) var chart = new Chart(ctx, {
		type: 'line',
		data: {
			labels: [],
			datasets: [{
				labels: [],
				label: 'Scatter Dataset',
				data: points,
				pointBackgroundColor: point_colors,
				backgroundColor: 'rgb(255, 99, 132)'
			}],
		},
		options: {
			aspectRatio: 1,
			responsive: true,
			maintainAspectRatio: true,
			plugins: {
				tooltip: {
					usePointStyle: true,
					callbacks: {
						label: function(context) {
							let label = /*context.dataset.label ||*/ '';
							label += "Position: (" + context.raw.x.toFixed(2) + ", " + context.raw.y.toFixed(2) + ")\n";
							label += "Time: " + context.raw.t.toFixed(2) + " s\n";
							label += "Velocity: " + context.raw.v.toFixed(2) + " m/s\n";
							console.log(context);
							return label;
						}
					}
				}
			},
			scales: {
				x: {
					type: 'linear',
					position: 'bottom',
					max: max + Math.abs(0.05 * max),
					min: min - Math.abs(0.05 * min),
				},
				y: {
					type: 'linear',
					position: 'left',
					max: max + Math.abs(0.05 * max),
					min: min - Math.abs(0.05 * min),
				}
			},
			parsing: {
				//labelKey: "t",
			}
		}
	});

	if (output) document.getElementById('results').innerHTML = `
    <br><br>
        <tr>
            <th>Measurement name</th>
            <th>Initial</th>
            <th>Final</th>
            <th>Change</th>
            <th>Max</th>
            <th>Min</th>
        </tr>
        <tr>
            <th>Vertical (m)</th>
            <td></td>
            <td></td>
            <td></td>
            <td>${max_y.toFixed(3)}</td>
            <td></td>
        </tr>
        <tr>
            <th>Horizontal (m)</th>
            <td></td>
            <td></td>
            <td></td>
            <td>${max_x.toFixed(3)}</td>
            <td></td>
        </tr>
        <tr>
            <th>Time (s)</th>
            <td></td>
            <td>${t.toFixed(3)}</td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <th>Velocity (m*s^-1)</th>
            <td>${v_0.toFixed(3)}</td>
            <td>${v.toFixed(3)}</td>
            <td>${(v - v_0).toFixed(3)}
            <td>${max_v.toFixed(3)}</td>
            <td>${min_v.toFixed(3)}</td>
        </tr>
		<!--
        <tr>
            <th>Rotation (rad*s^-1)</th>
            <td></td>
            <td>${/*omega.toFixed(3)*/null}</td>
            <td></td>
        </tr>
		-->
        <tr>
            <th>Angle (degrees)</th>
            <td></td>
            <td>${(Math.atan2(v_y, v_x) * 180 / Math.PI).toFixed(3)}</td>
            <td></td>
        </tr>
        <tr>
            <th>Energy (J)</th>
            <td>${(v_0 ** 2 * m / 2).toFixed(3)}</td>
            <td>${(v ** 2 * m / 2).toFixed(3)}</td>
            <td>${((v ** 2 * m / 2) - (v_0 ** 2 * m / 2)).toFixed(3)}</td>
        </tr>
    `

	return points;
}

function loadGolfBall() {
	document.forms[0].c_d.value = 0.3;
	document.forms[0].step.value = 0.1;
	document.forms[0].rho.value = 1.225;
	document.forms[0].alpha.value = 38;
	document.forms[0].m.value = 0.05;
	document.forms[0].g.value = 9.81;
	document.forms[0].v_0.value = 175;
	document.forms[0].r.value = 0.021;
	//document.forms[0].omega.value = 0;
	//document.forms[0].viscosity.value = 0.00018;
}

function lookupByProperty(
	output = false,
	property = document.forms[1].lookup_property_name.value,
	value = document.forms[1].lookup_property_value.value,
) {
	let match = points[1];
	points.forEach(point => {
		if (Math.abs(value - point[property]) < Math.abs(value - match[property])) {
			match = point;
		}
	})
	if (output) console.log(match);
	return match;
}

function createTable() {
	let columns = document.forms[2].columns.value.split(",")//.map(n=>Number(n));
	let rows = document.forms[2].rows.value;
	if (rows.includes("for")) {
		console.log("balls");
		rows = rows.slice(rows.indexOf("for")+3, rows.length).split(",");
		let newRows = [];
		for (let i = parseFloat(rows[0]); i <= parseFloat(rows[1]); i+=parseFloat(rows[2])) {
			newRows.push(i);
		}
		rows = newRows;
	} else {
		rows = rows.split(",").map(n=>Number(n));
	}
	let table_text = "<table><tr><th>V<sub>0</sub></th>"
	columns.forEach(column => {
		//table_text += "<th>"+column+"m</th>"
		table_text += "<th>"+column+"(m)</th>"
	})
	rows.forEach(row => {
		row = parseFloat(row);
		//points = calculateTrajectory(output=false, c_d=row)
		document.forms[0].v_0.value = row;
		points = calculateTrajectory(output=false);
		let row_text = "<tr><th>"+row+"</th>";
		console.log(points[points.length-1]);
		columns.forEach(column => {
			column = parseFloat(column);
			//row_text += "<td>"+lookupByProperty(output=false, property="y", value=column).t.toFixed(4) + "</td>";
			row_text += "<td>"+points[points.length-1].x.toFixed(4) + "</td>";
		});
		row_text += "</tr>"
		table_text += row_text
	});
	table_text += "</table>"
	document.getElementById("table_output").innerHTML = table_text;
}