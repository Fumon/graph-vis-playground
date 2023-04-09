import pl from 'nodejs-polars';
import { parse } from 'csv-parse/sync';

/** @type {import('./$types').RequestHandler} */
export function GET() {

    const data = parseFactoryCSVtoList();

    return new Response(JSON.stringify(data));
}

function parseFactoryCSVtoList() {


    const id = ( /** @type {any} */ it) => it;
    const csv_to_list = ( /** @type {string} */ it) => it.split(",");
    // const rationalt = ( /** @type {string} */ it) => {
    //     const nums = (it.startsWith('=') ? it.slice(1) : it).split("/").map((x) => parseInt(x));
    //     return nums.length == 1 ? nums[0] : nums[0] / nums[1];
    // };

    const strnum_tupt = /** @type {(it: String) => [String, String]} */ (it) => {
        const pair = it.split(":");
        return [pair[0], pair[1]];
    };

    const list_str_num_to_map = ( /** @type {String} */ it) => {

        let /** @type {Object.<String, String>} */ output = {};

        csv_to_list(it).forEach(it => {
            const [k, v] = strnum_tupt(it);
            output[k] = v;
        });

        return output;
    }

    const colmap = [{
            name: 'Item',
            index: 0,
            transform: id,
        },
        {
            name: 'Items',
            index: 1,
            transform: id,
        },
        {
            name: 'Inputs',
            index: 5,
            transform: list_str_num_to_map,
        },
        {
            name: 'Outputs',
            index: 11,
            transform: id,
        },
        {
            name: 'Targets',
            index: 12,
            transform: list_str_num_to_map,
        },
    ];



    const /** @type {[[String]]} */ data = parse(factorycsv);

    // const columns = data[0];

    // let column_output_map = colmap.reduce( /** @type {(acc: Object.<String, any[]>, cur: {name:String, index:Number, map:(it:String)=>any}) => Object.<String, [any]>} */ (acc, cur) => {
    //     acc[cur.name] = [];
    //     return acc;
    // }, {});

    let output = [];

    for (let i = 1; i < data.length; i++) {
        const row = data[i];

        output.push(colmap.reduce((acc, cur) => {
            acc.push(cur.transform(row[cur.index]));
            return acc;
        }, []));


    }

    return output;

}

const factorycsv = `Item,Items,Belts,Belt,Recipe,Inputs,Factories,Factory,FactoryModules,Power,Pollution,Outputs,Targets
iron-stick,=236,=59/225,transport-belt,iron-stick,"iron-plate:1180/15997",=59/45,assembling-machine-2,"module,module",=620/3,=59/15,"iron-stick:1","small-iron-electric-pole:10/59,medium-electric-pole:10/59,big-electric-pole:20/59,concrete:13/118,burner-inserter:10/59,long-handed-inserter:5/118"
copper-cable,=786,=131/150,transport-belt,copper-cable,"copper-plate:393/413",=131/30,assembling-machine-2,"module,module",=680,=13.1,"copper-cable:1","small-iron-electric-pole:20/393,medium-electric-pole:20/393,big-electric-pole:50/393,electric-motor:97/131,red-wire:5/393,green-wire:5/393,small-lamp:2/393"
iron-plate,=1599.7,=15997/9000,transport-belt,,,,,,,,,"iron-stick:1180/15997,electric-motor:970/15997,iron-gear-wheel:9038/15997,fast-inserter:200/15997,motor:979/15997,pipe:880/15997,long-handed-inserter:100/15997,transport-belt:370/15997,underground-belt:300/15997,splitter:480/15997,burner-assembling-machine:800/15997,burner-mining-drill:200/15997,pipe-to-ground:200/15997,steam-engine:200/15997,gun-turret:40/15997,small-lamp:10/15997,fuel-processor:50/15997"
copper-plate,=413,=413/900,transport-belt,,,,,,,,,"copper-cable:393/413,solar-panel:20/413"
medium-electric-pole,=10,=1/90,transport-belt,medium-electric-pole,"iron-stick:10/59,copper-cable:20/393,small-iron-electric-pole:0.5,steel-plate:50/551",=1/9,assembling-machine-2,"module,module",=65/3,=1/3,"medium-electric-pole:1",
small-iron-electric-pole,=20,=1/45,transport-belt,small-iron-electric-pole,"iron-stick:10/59,copper-cable:20/393",=2/9,assembling-machine-2,"module,module",=115/3,=2/3,"small-iron-electric-pole:1","medium-electric-pole:0.5"
steel-plate,=220.4,=551/2250,transport-belt,,,,,,,,,"medium-electric-pole:50/551,big-electric-pole:125/551,solar-panel:50/551,assembling-machine-2:25/551,steel-furnace:75/551,pumpjack:75/551,steel-wall:125/551,gate:1/551,chemical-plant:25/2204,oil-refinery:75/2204"
big-electric-pole,=10,=1/90,transport-belt,big-electric-pole,"iron-stick:20/59,copper-cable:50/393,concrete:1/13,steel-plate:125/551",=1/9,assembling-machine-2,"module,module",=65/3,=1/3,"big-electric-pole:1",
concrete,=130,=13/90,transport-belt,concrete,"iron-stick:13/118,stone-brick:5/17,sand:65/127,water:1",=26/9,assembling-machine-2,"module,module",=1345/3,=26/3,"concrete:1","big-electric-pole:1/13,concrete-wall:12/13"
water,=1300,=13/900,pipe,water,,=13/720,offshore-pump,,,,"water:1","concrete:1"
stone-brick,=221,=221/900,transport-belt,,,,,,,,,"concrete:5/17,burner-assembling-machine:40/221,steel-furnace:30/221,burner-mining-drill:20/221,stone-wall:3/13,fuel-processor:5/221,chemical-plant:5/442,oil-refinery:15/442"
sand,=254,=127/450,transport-belt,se-pulverised-sand,"stone:127/217",=127/180,se-space-mechanical-laboratory,"module,module,module,module",=1330/9,=127/45,"sand:1","concrete:65/127,glass-from-sand:62/127"
stone,=434/3,=217/1350,transport-belt,,,,,,,,,"se-pulverised-sand:127/217,stone-furnace:90/217"
glass,=31,=31/900,transport-belt,glass-from-sand,"sand:62/127,coal:1",=31/30,steel-furnace,,,=62/15,"glass:1","solar-panel:20/31,small-lamp:1/31,chemical-plant:5/62,oil-refinery:15/62"
coal,=279/200,=31/20000,transport-belt,,,,,,,,,"glass-from-sand:1"
electronic-circuit,=160.4,=401/2250,transport-belt,,,,,,,,,"solar-panel:150/401,fast-inserter:50/401,filter-inserter:50/401,fast-splitter:75/401,red-wire:25/401,green-wire:25/401,assembling-machine-2:25/401,gate:1/401"
electric-motor,=97,=97/900,transport-belt,electric-motor,"iron-gear-wheel:970/4519,copper-cable:97/131,iron-plate:970/15997",=388/225,assembling-machine-2,"module,module",=806/3,=388/75,"electric-motor:1","inserter:20/97,assembling-machine-1:10/97,assembling-machine-2:10/97,electric-mining-drill:20/97,steam-engine:6/97,pumpjack:20/97,offshore-pump:1/97,chemical-plant:5/194,oil-refinery:15/194"
iron-gear-wheel,=451.9,=4519/9000,transport-belt,iron-gear-wheel,"iron-plate:9038/15997",=4519/900,assembling-machine-2,"module,module",=4699/6,=4519/300,"iron-gear-wheel:1","electric-motor:970/4519,motor:979/4519,fast-transport-belt:750/4519,fast-underground-belt:600/4519,fast-splitter:300/4519,assembling-machine-1:400/4519,electric-mining-drill:200/4519,steam-engine:100/4519,pumpjack:200/4519,gun-turret:20/4519"
solar-panel,=4,=1/225,transport-belt,solar-panel,"electronic-circuit:150/401,glass:20/31,steel-plate:50/551,copper-plate:20/413",=8/9,assembling-machine-2,"module,module",=415/3,=8/3,"solar-panel:1",
inserter,=20,=1/45,transport-belt,inserter,"electric-motor:20/97,burner-inserter:1",=2/9,assembling-machine-2,"module,module",=115/3,=2/3,"inserter:1","fast-inserter:0.5,long-handed-inserter:0.25"
burner-inserter,=20,=1/45,transport-belt,burner-inserter,"iron-stick:10/59,motor:200/979",=2/9,assembling-machine-2,"module,module",=115/3,=2/3,"burner-inserter:1","inserter:1"
motor,=97.9,=979/9000,transport-belt,motor,"iron-gear-wheel:979/4519,iron-plate:979/15997",=979/750,assembling-machine-2,"module,module",=205.8,=979/250,"motor:1","burner-inserter:200/979,transport-belt:370/979,splitter:240/979,burner-assembling-machine:100/979,burner-mining-drill:50/979,gate:4/979,gun-turret:10/979,fuel-processor:5/979"
pipe,=88,=22/225,transport-belt,pipe,"iron-plate:880/15997",=44/45,assembling-machine-2,"module,module",=455/3,=44/15,"pipe:1","pipe-to-ground:5/11,boiler:1/11,pumpjack:5/22,offshore-pump:1/44,chemical-plant:5/176,oil-refinery:15/176"
long-handed-inserter,=5,=1/180,transport-belt,long-handed-inserter,"iron-stick:5/118,inserter:0.25,iron-plate:100/15997",=1/18,assembling-machine-2,"module,module",=40/3,=1/6,"long-handed-inserter:1",
filter-inserter,=5,=1/180,transport-belt,filter-inserter,"electronic-circuit:50/401,fast-inserter:0.5",=1/18,assembling-machine-2,"module,module",=40/3,=1/6,"filter-inserter:1",
fast-inserter,=10,=1/90,transport-belt,fast-inserter,"electronic-circuit:50/401,inserter:0.5,iron-plate:200/15997",=1/9,assembling-machine-2,"module,module",=65/3,=1/3,"fast-inserter:1","filter-inserter:0.5"
transport-belt,=74,=37/450,transport-belt,transport-belt,"motor:370/979,iron-plate:370/15997",=37/90,assembling-machine-2,"module,module",=200/3,=37/30,"transport-belt:1","underground-belt:15/74,splitter:12/37,fast-transport-belt:15/74"
fast-transport-belt,=15,=1/60,transport-belt,fast-transport-belt,"iron-gear-wheel:750/4519,transport-belt:15/74",=1/6,assembling-machine-2,"module,module",=30,=0.5,"fast-transport-belt:1",
fast-underground-belt,=3,=1/300,transport-belt,fast-underground-belt,"iron-gear-wheel:600/4519,underground-belt:0.5",=1/15,assembling-machine-2,"module,module",=15,=0.2,"fast-underground-belt:1",
underground-belt,=6,=1/150,transport-belt,underground-belt,"transport-belt:15/74,iron-plate:300/15997",=1/15,assembling-machine-2,"module,module",=15,=0.2,"underground-belt:1","fast-underground-belt:0.5"
fast-splitter,=3,=1/300,transport-belt,fast-splitter,"iron-gear-wheel:300/4519,electronic-circuit:75/401,splitter:0.5",=2/15,assembling-machine-2,"module,module",=25,=0.4,"fast-splitter:1",
splitter,=6,=1/150,transport-belt,splitter,"motor:240/979,transport-belt:12/37,iron-plate:480/15997",=2/15,assembling-machine-2,"module,module",=25,=0.4,"splitter:1","fast-splitter:0.5"
red-wire,=10,=1/90,transport-belt,red-wire,"copper-cable:5/393,electronic-circuit:25/401",=1/9,assembling-machine-2,"module,module",=65/3,=1/3,"red-wire:1",
green-wire,=10,=1/90,transport-belt,green-wire,"copper-cable:5/393,electronic-circuit:25/401",=1/9,assembling-machine-2,"module,module",=65/3,=1/3,"green-wire:1",
assembling-machine-2,=5,=1/180,transport-belt,assembling-machine-2,"electric-motor:10/97,electronic-circuit:25/401,assembling-machine-1:0.5,steel-plate:25/551",=1/18,assembling-machine-2,"module,module",=40/3,=1/6,"assembling-machine-2:1",
assembling-machine-1,=10,=1/90,transport-belt,assembling-machine-1,"iron-gear-wheel:400/4519,electric-motor:10/97,burner-assembling-machine:1",=1/9,assembling-machine-2,"module,module",=65/3,=1/3,"assembling-machine-1:1","assembling-machine-2:0.5"
burner-assembling-machine,=10,=1/90,transport-belt,burner-assembling-machine,"motor:100/979,stone-brick:40/221,iron-plate:800/15997",=1/9,assembling-machine-2,"module,module",=65/3,=1/3,"burner-assembling-machine:1","assembling-machine-1:1"
stone-furnace,=12,=1/75,transport-belt,stone-furnace,"stone:90/217",=2/15,assembling-machine-2,"module,module",=25,=0.4,"stone-furnace:1","steel-furnace:5/12,boiler:1/6"
steel-furnace,=5,=1/180,transport-belt,steel-furnace,"stone-brick:30/221,stone-furnace:5/12,steel-plate:75/551",=1/3,assembling-machine-2,"module,module",=55,=1,"steel-furnace:1",
electric-mining-drill,=5,=1/180,transport-belt,electric-mining-drill,"iron-gear-wheel:200/4519,electric-motor:20/97,burner-mining-drill:1",=2/9,assembling-machine-2,"module,module",=115/3,=2/3,"electric-mining-drill:1",
burner-mining-drill,=5,=1/180,transport-belt,burner-mining-drill,"motor:50/979,stone-brick:20/221,iron-plate:200/15997",=2/9,assembling-machine-2,"module,module",=115/3,=2/3,"burner-mining-drill:1","electric-mining-drill:1"
pipe-to-ground,=8,=2/225,transport-belt,pipe-to-ground,"pipe:5/11,iron-plate:200/15997",=2/45,assembling-machine-2,"module,module",=35/3,=2/15,"pipe-to-ground:1",
boiler,=2,=1/450,transport-belt,boiler,"pipe:1/11,stone-furnace:1/6",=1/45,assembling-machine-2,"module,module",=25/3,=1/15,"boiler:1",
steam-engine,=2,=1/450,transport-belt,steam-engine,"iron-gear-wheel:100/4519,electric-motor:6/97,iron-plate:200/15997",=1/45,assembling-machine-2,"module,module",=25/3,=1/15,"steam-engine:1",
pumpjack,=2,=1/450,transport-belt,pumpjack,"iron-gear-wheel:200/4519,electric-motor:20/97,pipe:5/22,steel-plate:75/551",=2/9,assembling-machine-2,"module,module",=115/3,=2/3,"pumpjack:1",
offshore-pump,=0.5,=1/1800,transport-belt,offshore-pump,"electric-motor:1/97,pipe:1/44",=1/180,assembling-machine-2,"module,module",=35/6,=1/60,"offshore-pump:1",
steel-wall,=10,=1/90,transport-belt,steel-wall,"steel-plate:125/551,concrete-wall:1",=1/9,assembling-machine-2,"module,module",=65/3,=1/3,"steel-wall:1",
concrete-wall,=10,=1/90,transport-belt,concrete-wall,"concrete:12/13,stone-wall:50/51",=1/9,assembling-machine-2,"module,module",=65/3,=1/3,"concrete-wall:1","steel-wall:1"
stone-wall,=10.2,=17/1500,transport-belt,stone-wall,"stone-brick:3/13",=17/150,assembling-machine-2,"module,module",=22,=0.34,"stone-wall:1","concrete-wall:50/51,gate:1/51"
gate,=0.2,=1/4500,transport-belt,gate,"motor:4/979,electronic-circuit:1/401,steel-plate:1/551,stone-wall:1/51",=1/450,assembling-machine-2,"module,module",=16/3,=1/150,"gate:1",
gun-turret,=0.2,=1/4500,transport-belt,gun-turret,"iron-gear-wheel:20/4519,motor:10/979,iron-plate:40/15997",=8/225,assembling-machine-2,"module,module",=31/3,=8/75,"gun-turret:1",
small-lamp,=1,=1/900,transport-belt,small-lamp,"copper-cable:2/393,glass:1/31,iron-plate:10/15997",=1/90,assembling-machine-2,"module,module",=20/3,=1/30,"small-lamp:1",
fuel-processor,=0.5,=1/1800,transport-belt,fuel-processor,"motor:5/979,stone-brick:5/221,iron-plate:50/15997",=2/45,assembling-machine-2,"module,module",=35/3,=2/15,"fuel-processor:1",
chemical-plant,=0.5,=1/1800,transport-belt,chemical-plant,"electric-motor:5/194,pipe:5/176,stone-brick:5/442,glass:5/62,steel-plate:25/2204",=1/18,assembling-machine-2,"module,module",=40/3,=1/6,"chemical-plant:1",
oil-refinery,=0.5,=1/1800,transport-belt,oil-refinery,"electric-motor:15/194,pipe:15/176,stone-brick:15/442,glass:15/62,steel-plate:75/2204",=4/45,assembling-machine-2,"module,module",=55/3,=4/15,"oil-refinery:1",`;