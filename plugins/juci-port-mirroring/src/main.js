UCI.$registerConfig("port-mirroring"); 
UCI["port-mirroring"].$registerSectionType("port-mirroring", {
	"source_ports":		{ dvalue: "", type: String },
	"promiscuous":		{ dvalue: 1, type: Boolean},
	"target":		{ dvalue: "", type: String},
	"protocol":		{ dvalue: "TEE", type: String},
	"filter":		{ dvalue: "", type: String}
}); 

