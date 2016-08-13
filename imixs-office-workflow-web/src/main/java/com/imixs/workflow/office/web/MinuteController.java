package com.imixs.workflow.office.web;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

import javax.enterprise.context.ConversationScoped;
import javax.inject.Named;

import org.imixs.marty.workflow.ChildWorkitemController;
import org.imixs.workflow.ItemCollection;
import org.imixs.workflow.WorkflowKernel;

/**
 * The MinuteController is a session scoped backing bean to provide a list of
 * team member profiles. The controller provides alos methods to add or remove a
 * entry into the member list
 * 
 * @author rsoika
 * 
 */
@Named
@ConversationScoped
public class MinuteController extends ChildWorkitemController implements Serializable {

	private static final long serialVersionUID = 1L;

	private static Logger logger = Logger.getLogger(MinuteController.class.getName());

	
	/**
	 * This method overwrites the behavior of the childWorkitemController. The
	 * method returns all minutes sorted by numSequenceNumber
	 * 
	 * @return - sorted list of minutes
	 */
	@Override
	public List<ItemCollection> loadWorkitems() {
		logger.fine("load minute list...");
		List<ItemCollection> minutes = new ArrayList<ItemCollection>();

		if (getParentWorkitem() != null) {
			String uniqueIdRef = getParentWorkitem().getItemValueString(WorkflowKernel.UNIQUEID);
			if (!uniqueIdRef.isEmpty()) {
				String sQuery = null;
				sQuery = "SELECT wi FROM Entity as wi ";
				sQuery += " JOIN wi.textItems as r ";
				sQuery += " JOIN wi.integerItems as n ";
				sQuery += " WHERE wi.type IN ('workitem','childworkitem','workitemarchive','childworkitemarchive')  ";
				sQuery += " AND r.itemName = '$uniqueidref' and r.itemValue = '" + uniqueIdRef + "'";
				sQuery += " AND n.itemName = 'numsequencenumber' ";
				sQuery += " ORDER BY n.itemValue";
				minutes = this.getEntityService().findAllEntities(sQuery, 0, -1);
			}
		}
		return minutes;
	}

}
