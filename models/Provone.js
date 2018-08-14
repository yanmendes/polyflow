var Provone = {
	Classes: {
		//P-Prov
		PROGRAM : "provone_Program",
		PORT : "provone_Port",
		CHANNEL : "provone_Channel",
		CONTROLLER : "provone_Controller",
		WORKFLOW : "provone_Workflow",
		//R-Prov
		EXECUTION : "provone_Execution",
		USER : "provone_User",
		//Data representation
		VISUALIZATION : "provone_Visualization",
		DATA : "provone_Data",
		DOCUMENT : "provone_Document",
	},
	Relationships: {
		//P-Prov
		HASSUBPROGRAM: "provone_hasSubProgram",
		CONTROLLEDBY: "provone_controlledBy",
		CONTROLS: "provone_controls",
		HASINPORT: "provone_hasInPort",
		HASOUTPORT: "provone_hasOutPort",
		HASDEFAULTPARAM: "provone_hasDefaultParam",
		CONNECTSTO: "provone_connectsTo",
		//R-Prov
		WASPARTOF: "provone_wasPartOf",
		HADINPORT: "provone_hadInPort",
		HADENTITY: "provone_hadEntity",
		HADOUTPORT: "provone_hadOutPort"
	}
};

module.exports = Provone;