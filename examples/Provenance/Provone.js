export default {
  Classes: {
    // P-Prov
    PROGRAM: 'provone_program',
    PORT: 'provone_port',
    CHANNEL: 'provone_channel',
    CONTROLLER: 'provone_controller',
    WORKFLOW: 'provone_workflow',
    // R-Prov
    EXECUTION: 'provone_execution',
    USER: 'provone_user',
    // Data representation
    VISUALIZATION: 'provone_visualization',
    DATA: 'provone_data',
    DOCUMENT: 'provone_document'
  },
  Relationships: {
    // P-Prov
    HASSUBPROGRAM: 'provone_hasSubProgram',
    CONTROLLEDBY: 'provone_controlledBy',
    CONTROLS: 'provone_controls',
    HASINPORT: 'provone_hasInPort',
    HASOUTPORT: 'provone_hasOutPort',
    HASDEFAULTPARAM: 'provone_hasDefaultParam',
    CONNECTSTO: 'provone_connectsTo',
    // R-Prov
    WASPARTOF: 'provone_wasPartOf',
    HADINPORT: 'provone_hadInPort',
    HADENTITY: 'provone_hadEntity',
    HADOUTPORT: 'provone_hadOutPort'
  }
}
