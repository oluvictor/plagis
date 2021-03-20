package org.imixs.workflow.office.views;

import java.util.List;
import java.util.logging.Logger;

import javax.faces.view.ViewScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObjectBuilder;

import org.imixs.marty.model.TeamController;
import org.imixs.marty.profile.UserController;
import org.imixs.marty.util.ResourceBundleHandler;
import org.imixs.workflow.ItemCollection;
import org.imixs.workflow.faces.data.ViewController;

/**
 * The OrganigramController generates the JSON data structure used by the
 * Orgchart (https://github.com/dabeng/OrgChart).
 * <p>
 * The controller provices two data structures 'datasourceProcesses' and
 * 'datasourceSpaces'. The structure looks like this:
 * <p>
 * 
 * <pre>
 * {
    'name' : 'Prozesse',
    'id' : 'root',
    'title' : 'Organisations Bereiche',
    'children' : [
            {
                'name' : 'Controlling',
                'id' : 'unter-id1',
                'title' : 'Invoices',
                'className' : 'process'
                
            }, {
                'name' : 'HR',
                'title' : 'Human Source processes',
                'className' : 'process'
            }
           ]
    };
 * </pre>
 * 
 * 
 * 
 * 
 * 
 * @author rsoika
 *
 */
@Named
@ViewScoped
public class OrganigramController extends ViewController {

	private static final long serialVersionUID = 1L;
	private static Logger logger = Logger.getLogger(OrganigramController.class.getName());

	@Inject
	TeamController teamController;

	@Inject
	ResourceBundleHandler resourceBundleHandler;
	
	@Inject
	UserController userController;

	/**
	 * Returns a json structure with the process data
	 * 
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public String getProcessDatasource() {
		List<ItemCollection> processList = teamController.getProcessList();

		// 'name' : 'Prozesse',
		// 'id' : 'root',
		// 'title' : 'Organisations Bereiche',
		JsonObjectBuilder jsonBuilder = Json.createObjectBuilder();
		jsonBuilder.add("id", "root").add("name", resourceBundleHandler.findMessage("organigram.processes"))
				.add("title", resourceBundleHandler.findMessage("organigram.processes.description"));

		// build childs...
		JsonArrayBuilder childList = Json.createArrayBuilder();
		for (ItemCollection process : processList) {
			// 'name' : 'Controlling',
			// 'id' : 'id1',
			// 'title' : 'Invoices',
			// 'className' : 'process'
			JsonObjectBuilder processObject = Json.createObjectBuilder();

			processObject.add("name", process.getItemValueString("name"))
					.add("title", process.getItemValueString("txtdescription")).add("id", process.getUniqueID())
					.add("className", "process");

			// add team members....
			List<String> members = process.getItemValue("process.team");
			JsonArrayBuilder memberArray = Json.createArrayBuilder();
			for (String member : members) {
				String userName=userController.getUserName(member);
				if (userName!=null) {
					memberArray.add(userName);
				}
			}
			processObject.add("team", memberArray);

			members = process.getItemValue("process.manager");
			memberArray = Json.createArrayBuilder();
			for (String member : members) {
				String userName=userController.getUserName(member);
				if (userName!=null) {
					memberArray.add(userName);
				}
			}
			processObject.add("manager", memberArray);

			members = process.getItemValue("process.assist");
			memberArray = Json.createArrayBuilder();
			for (String member : members) {
				String userName=userController.getUserName(member);
				if (userName!=null) {
					memberArray.add(userName);
				}
			}
			processObject.add("assist", memberArray);
			childList.add(processObject);
		}
		// add childs
		jsonBuilder.add("children", childList);

		String result = jsonBuilder.build().toString();
		// logger.info(result);
		return result;

	}

	/**
	 * Returns a json structure with the space data
	 * 
	 * @return
	 */
	public String getSpaceDatasource() {

		// 'name' : 'Prozesse',
		// 'id' : 'root',
		// 'title' : 'Organisations Bereiche',
		JsonObjectBuilder jsonBuilder = Json.createObjectBuilder();
		jsonBuilder.add("id", "root").add("name", resourceBundleHandler.findMessage("organigram.spaces")).add("title",
				resourceBundleHandler.findMessage("organigram.spaces.description"));

		// create root space structure including all sub spaces
		JsonArrayBuilder rootSpaces = buildSpacesObjectArray(null);
		// add root spaces
		jsonBuilder.add("children", rootSpaces);

		String result = jsonBuilder.build().toString();
		// logger.info(result);
		return result;

	}

	/**
	 * Returns a JsonArrayBuilder object containing all sub spaces to a given root
	 * space reference.
	 * <p>
	 * The method returns null if no spaces were found
	 * <p>
	 * If the parentSpaceID is null, only root spaces are returned.
	 */
	@SuppressWarnings("unchecked")
	private JsonArrayBuilder buildSpacesObjectArray(String parentSpaceID) {
		List<ItemCollection> spacesList = null;

		// test if we should return root spaces or subspaces
		if (parentSpaceID == null || parentSpaceID.isEmpty()) {
			spacesList = teamController.getRootSpaces();
			logger.finest("...add root spaces...");
		} else {
			spacesList = teamController.getSpacesByRef(parentSpaceID);
			logger.finest("...add sub spaces for " + parentSpaceID);
		}
		if (spacesList == null || spacesList.size() == 0) {
			return null;
		}

		// build childs...
		JsonArrayBuilder childListArray = Json.createArrayBuilder();
		for (ItemCollection space : spacesList) {
			// 'name' : 'Controlling',
			// 'id' : 'id1',
			// 'title' : 'Invoices',
			// 'className' : 'process'

			JsonObjectBuilder spaceObject = Json.createObjectBuilder()
					.add("name", space.getItemValueString("space.name"))
					.add("title", space.getItemValueString("txtdescription")).add("id", space.getUniqueID())
					.add("className", "space");

			// add team members....
			List<String> members = space.getItemValue("space.team");
			JsonArrayBuilder memberArray = Json.createArrayBuilder();
			for (String member : members) {
				String userName=userController.getUserName(member);
				if (userName!=null) {
					memberArray.add(userName);
				}
			}
			spaceObject.add("team", memberArray);

			members = space.getItemValue("space.manager");
			memberArray = Json.createArrayBuilder();
			for (String member : members) {
				String userName=userController.getUserName(member);
				if (userName!=null) {
					memberArray.add(userName);
				}
			}
			spaceObject.add("manager", memberArray);

			members = space.getItemValue("space.assist");
			memberArray = Json.createArrayBuilder();
			for (String member : members) {
				String userName=userController.getUserName(member);
				if (userName!=null) {
					memberArray.add(userName);
				}
			}
			spaceObject.add("assist", memberArray);

			// we recursive all sub spaces....
			JsonArrayBuilder subSpaces = buildSpacesObjectArray(space.getUniqueID());
			if (subSpaces != null) {
				logger.finest("...found sub spaces!");
				spaceObject.add("children", subSpaces);
			}
			childListArray.add(spaceObject);
		}
		return childListArray;

	}
}