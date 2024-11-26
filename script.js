document.getElementById('calculate').addEventListener('click', () => {
    const ip = document.getElementById('ip').value;
    const netmask = parseInt(document.getElementById('netmask').value, 10);
    const newNetmask = parseInt(document.getElementById('new-netmask').value, 10);

    if (!ip || isNaN(netmask)) {
        alert("Por favor, ingrese una IP válida y una máscara de subred.");
        return;
    }

    let result = calculateSubnet(ip, netmask);

    if (!isNaN(newNetmask) && newNetmask > netmask) {
        result += `\nSubnets after transition from /${netmask} to /${newNetmask}:\n`;
        result += calculateSubnets(ip, netmask, newNetmask);
    }

    document.getElementById('result').innerText = result;
});

function calculateSubnet(ip, netmask) {
    const ipBinary = formatBinary(ipToBinary(ip));
    const maskBinary = formatBinary(netmaskToBinary(netmask));
    const wildcardBinary = formatBinary(wildcardFromNetmask(netmaskToBinary(netmask)));

    const network = ipToBinary(ip).substring(0, netmask) + '0'.repeat(32 - netmask);
    const networkBinary = formatBinary(network);
    const broadcast = ipToBinary(ip).substring(0, netmask) + '1'.repeat(32 - netmask);
    const broadcastBinary = formatBinary(broadcast);

    const hostMin = network.slice(0, -1) + '1';
    const hostMax = broadcast.slice(0, -1) + '0';

    const networkDecimal = binaryToDecimal(network);
    const broadcastDecimal = binaryToDecimal(broadcast);
    const classType = getClassType(ip);

    return `
Address: ${ip} (${ipBinary})
Netmask: ${binaryToDecimal(netmaskToBinary(netmask))} (${netmask}) (${maskBinary})
Wildcard: ${binaryToDecimal(wildcardFromNetmask(netmaskToBinary(netmask)))} (${wildcardBinary})
Network: ${networkDecimal} (${networkBinary})
HostMin: ${binaryToDecimal(hostMin)} (${formatBinary(hostMin)})
HostMax: ${binaryToDecimal(hostMax)} (${formatBinary(hostMax)})
Broadcast: ${broadcastDecimal} (${broadcastBinary})
Hosts/Net: ${Math.pow(2, 32 - netmask) - 2}
Class: ${classType}
    `;
}

function calculateSubnets(ip, oldMask, newMask) {
    const ipBinary = ipToBinary(ip);
    const subnets = [];
    const increment = Math.pow(2, 32 - newMask);

    for (let i = 0; i < Math.pow(2, newMask - oldMask); i++) {
        const network = parseInt(ipBinary, 2) + i * increment;
        const binaryNetwork = network.toString(2).padStart(32, '0');
        const formattedBinaryNetwork = formatBinary(binaryNetwork);
        const broadcast = parseInt(binaryNetwork, 2) + increment - 1;
        const binaryBroadcast = broadcast.toString(2).padStart(32, '0');
        const formattedBinaryBroadcast = formatBinary(binaryBroadcast);

        const hostMin = binaryNetwork.slice(0, -1) + '1';
        const hostMax = binaryBroadcast.slice(0, -1) + '0';

        subnets.push(`
Network: ${binaryToDecimal(binaryNetwork)}/${newMask} (${formattedBinaryNetwork})
HostMin: ${binaryToDecimal(hostMin)} (${formatBinary(hostMin)})
HostMax: ${binaryToDecimal(hostMax)} (${formatBinary(hostMax)})
Broadcast: ${binaryToDecimal(binaryBroadcast)} (${formattedBinaryBroadcast})
Hosts/Net: ${Math.pow(2, 32 - newMask) - 2}
        `);
    }

    return subnets.join('\n');
}

function ipToBinary(ip) {
    return ip.split('.').map(octet => parseInt(octet).toString(2).padStart(8, '0')).join('');
}

function netmaskToBinary(netmask) {
    return '1'.repeat(netmask).padEnd(32, '0');
}

function wildcardFromNetmask(maskBinary) {
    return maskBinary.split('').map(bit => (bit === '1' ? '0' : '1')).join('');
}

function binaryToDecimal(binary) {
    return binary.match(/.{1,8}/g).map(bin => parseInt(bin, 2)).join('.');
}

function getClassType(ip) {
    const firstOctet = parseInt(ip.split('.')[0]);
    if (firstOctet >= 1 && firstOctet <= 126) return "Class A";
    if (firstOctet >= 128 && firstOctet <= 191) return "Class B";
    if (firstOctet >= 192 && firstOctet <= 223) return "Class C";
    if (firstOctet >= 224 && firstOctet <= 239) return "Class D (Multicast)";
    return "Class E (Experimental)";
}

function formatBinary(binary) {
    return binary.match(/.{1,8}/g).join('.');
}
