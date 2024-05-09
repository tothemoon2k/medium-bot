require('dotenv').config();

const nodeMavenEmail = process.env.NODEMAVEN_EMAIL;
const nodeMavenPass = process.env.NODEMAVEN_PASS;

const proxies = [
    `http://${nodeMavenEmail}-country-us-sid-3ypfktxj-filter-medium:${nodeMavenPass}@gate.nodemaven.com:8080`,
    `http://${nodeMavenEmail}-country-us-sid-ppozxddvifm2s-filter-medium:${nodeMavenPass}@gate.nodemaven.com:8080`,
    `http://${nodeMavenEmail}-country-us-sid-i2e0lmru7tux-filter-medium:${nodeMavenPass}@gate.nodemaven.com:8080`,
    `http://${nodeMavenEmail}-country-us-sid-t0gm9fepqve-filter-medium:${nodeMavenPass}@gate.nodemaven.com:8080`,
    `http://${nodeMavenEmail}-country-us-sid-9vb9wa9jk-filter-medium:${nodeMavenPass}@gate.nodemaven.com:8080`,
    `http://${nodeMavenEmail}-country-us-sid-ntlcbuvo-filter-medium:${nodeMavenPass}@gate.nodemaven.com:8080`,
    `http://${nodeMavenEmail}-country-us-sid-7kcojntmzqqqbggw1-filter-medium:${nodeMavenPass}@gate.nodemaven.com:8080`,
    `http://${nodeMavenEmail}-country-us-sid-pcgbdkxzfba3pdnwbaoa-filter-medium:${nodeMavenPass}@gate.nodemaven.com:8080`,
    `http://${nodeMavenEmail}-country-us-sid-osgoncp3iz-filter-medium:${nodeMavenPass}@gate.nodemaven.com:8080`,
    `http://${nodeMavenEmail}-country-us-sid-qasafakxurgm-filter-medium:${nodeMavenPass}@gate.nodemaven.com:8080`,
    `http://${nodeMavenEmail}-country-us-sid-fvxbm3n513g4swtwfm8-filter-medium:${nodeMavenPass}@gate.nodemaven.com:8080`,
    `http://${nodeMavenEmail}-country-us-sid-wczoclg9hrlc0yvp-filter-medium:${nodeMavenPass}@gate.nodemaven.com:8080`,
    `http://${nodeMavenEmail}-country-us-sid-vu60aua05hl-filter-medium:${nodeMavenPass}@gate.nodemaven.com:8080`,
    `http://${nodeMavenEmail}-country-us-sid-pmjmncxr82mnqzi0xb-filter-medium:${nodeMavenPass}@gate.nodemaven.com:8080`,
    `http://${nodeMavenEmail}-country-us-sid-bkqke4zngekvxaa-filter-medium:${nodeMavenPass}@gate.nodemaven.com:8080`,
    `http://${nodeMavenEmail}-country-us-sid-s0y19ou06ah5hm88vnk7-filter-medium:${nodeMavenPass}@gate.nodemaven.com:8080`,
    `http://${nodeMavenEmail}-country-us-sid-c6ytptgzkppxjjtcq-filter-medium:${nodeMavenPass}@gate.nodemaven.com:8080`,
    `http://${nodeMavenEmail}-country-us-sid-mqwaf8bds-filter-medium:${nodeMavenPass}@gate.nodemaven.com:8080`,
    `http://${nodeMavenEmail}-country-us-sid-bxw60gesxdp-filter-medium:${nodeMavenPass}@gate.nodemaven.com:8080`,
    `http://${nodeMavenEmail}-country-us-sid-lknyzqkzyuxrxnmaerjp-filter-medium:${nodeMavenPass}@gate.nodemaven.com:8080`,
    `http://${nodeMavenEmail}-country-us-sid-psp2pjacytstk-filter-medium:${nodeMavenPass}@gate.nodemaven.com:8080`,
    `http://${nodeMavenEmail}-country-us-sid-qlplmpf1wv-filter-medium:${nodeMavenPass}@gate.nodemaven.com:8080`,
    `http://${nodeMavenEmail}-country-us-sid-7ov3o0kctpwjs-filter-medium:${nodeMavenPass}@gate.nodemaven.com:8080`,
    `http://${nodeMavenEmail}-country-us-sid-n2elhq4a3-filter-medium:${nodeMavenPass}@gate.nodemaven.com:8080`,
    `http://${nodeMavenEmail}-country-us-sid-xdku2ay9o-filter-medium:${nodeMavenPass}@gate.nodemaven.com:8080`,
    `http://${nodeMavenEmail}-country-us-sid-bnsbt9iprl-filter-medium:${nodeMavenPass}@gate.nodemaven.com:8080`,
    `http://${nodeMavenEmail}-country-us-sid-8y8t1fcivcx1mj-filter-medium:${nodeMavenPass}@gate.nodemaven.com:8080`,
    `http://${nodeMavenEmail}-country-us-sid-o8hufoglof3dxc3-filter-medium:${nodeMavenPass}@gate.nodemaven.com:8080`,
    `http://${nodeMavenEmail}-country-us-sid-zphqfqjotwenfwav-filter-medium:${nodeMavenPass}@gate.nodemaven.com:8080`,
    `http://${nodeMavenEmail}-country-us-sid-pdmz07yv8zv5-filter-medium:${nodeMavenPass}@gate.nodemaven.com:8080`,
    `http://${nodeMavenEmail}-country-us-sid-jgw9n9cfisioovh-filter-medium:${nodeMavenPass}@gate.nodemaven.com:8080`,
    `http://${nodeMavenEmail}-country-us-sid-ybltghqmqbm1ettdw-filter-medium:${nodeMavenPass}@gate.nodemaven.com:8080`,
    `http://${nodeMavenEmail}-country-us-sid-b7k5lpw1konushxl8-filter-medium:${nodeMavenPass}@gate.nodemaven.com:8080`,
    `http://${nodeMavenEmail}-country-us-sid-ofk2axg7xtmtox98lp-filter-medium:${nodeMavenPass}@gate.nodemaven.com:8080`,
    `http://${nodeMavenEmail}-country-us-sid-fbmytubtibj53mtjdk-filter-medium:${nodeMavenPass}@gate.nodemaven.com:8080`,
    `http://${nodeMavenEmail}-country-us-sid-oph6epvi34d-filter-medium:${nodeMavenPass}@gate.nodemaven.com:8080`
]

module.exports = {proxies};