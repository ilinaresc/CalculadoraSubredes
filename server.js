const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

app.post('/calculate', (req, res) => {
    const { ip, netmask } = req.body;
    // Reutilizar las funciones de cálculo aquí
    const result = calculateSubnet(ip, netmask);
    res.json({ result });
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
