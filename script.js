function calculateTrajectory() {
    var c_d = document.forms[0].c_d.value;
    var rho = document.forms[0].rho.value;
    var A = document.forms[0].A.value;
    var a = document.forms[0].alpha.value;
    var m = document.forms[0].m.value;
    var g = document.forms[0].g.value;
    var v_0 = document.forms[0].v_0.value;

    //c_d = 0;
    //rho = 1.225;
    //a=45;
    //A = 1;
    //m = 1;
    //v_0 = 10;

    var x = 0;
    var y = 0;
    var v_x = v_0 * Math.cos(a * Math.PI / 180);
    var v_y = v_0 * Math.sin(a * Math.PI / 180);

    var mu = () => { return (c_d * rho * A) / (2 * m) };

    var v = Math.sqrt(v_x ** 2 + v_y ** 2);
    var dv_x = (t) => { return t * (-mu() * v_x * v)};
    var dv_y = (t) => { return t * (-g - mu() * v_y * v)};
    var dx = (t) => { v_x += dv_x(t); return v_x*t; };
    var dy = (t) => { v_y += dv_y(t); return v_y*t; };
    console.log(v_x, v_y);

    var points = [{x, y}];
    var dt = (v) => {return 1/v};
    dt = 0.25/v;
    var t = 0;
    while (y >= 0 || dy(dt) >= 0 || t < 2) {
        dt = 0.25/v;
        v = Math.sqrt(v_x ** 2 + v_y ** 2);
        t += dt;
        x += dx(dt);
        y += dy(dt);
        points.push({ x: x, y: y });
    }

    // Now graph it
    document.getElementById('output').innerHTML = "<canvas id='graph'></canvas>";
    var ctx = document.getElementById('graph');
    var chart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Scatter Dataset',
                data: points,
                backgroundColor: 'rgb(255, 99, 132)'
            }],
        },
        options: {
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom'
                }
            }
        }
    });
    console.log(points);

    return false;
}