var Prov = {
	Classes: {
		//R-Prov
		ASSOCIATION: 'prov_association',
		USAGE: 'prov_usage',
		GENERATION: 'prov_generation',
		//Data representation
		ENTITY: 'prov_entity',
		COLLECTION: 'prov_collection'
	},
	Relationships: {
		//P-Prov
		WASDERIVEDFROM: "prov_wasDerivedFrom",
		//R-Prov
		USED: "prov_used",
		WASGENERATEDBY: "prov_wasGeneratedBy",
		WASASSOCIATEDWITH: "prov_wasAssociatedWith",
		WASINFORMEDBY: "prov_wasInformedBy",
		QUALIFIEDASSOCIATION: "prov_qualifiedAssociation",
		AGENT: "prov_agent",
		HADPLAN: "prov_hadPlan",
		QUALIFIEDUSAGE: "prov_qualifiedUsage",
		QUALIFIEDGENERATION: "prov_qualifiedGeneration",
		//Data representation
		HADMEMBER: "prov_hadMember"
	},
	Attributes: {
		STARTEDATTIME: "prov_startedAtTime",
		ENDEDATTIME: "prov_endedAtTime"
	}
};

module.exports = Prov;
