using MobileReportService.Models;
using Newtonsoft.Json;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Dynamic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Text;
using System.Web.Script.Serialization;
using System.Xml.Linq;

namespace MobileReportService
{
    
    public class Service : IService
    {

        public void GetOptions()
        {
            WebOperationContext.Current.OutgoingResponse.Headers.Add("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
            WebOperationContext.Current.OutgoingResponse.Headers.Add("Access-Control-Allow-Headers", "Content-Type");
        }

        public XElement Test(string name)
        {
          using (var db = new ReportEntities())
          {
              XElement xelement = XElement.Parse(db.Database.SqlQuery<string>("SELECT CAST(CAST(Content AS VARBINARY(MAX)) AS XML) AS DashboardXML FROM ReportServer$SRVSQL2012.dbo.Catalog WHERE Name = '" + name + ".xml'").FirstOrDefault<string>());
              return xelement;
          }
        }

        public List<string> GetAllXMLName()
        {
            var nameList = new List<string>();
            using ( var db = new ReportEntities())
            {
                var dbList = db.Catalog.Where(x => x.Path.Contains("/Dashboard/")).Select(x => x.Name).ToList();
                foreach(var item in dbList)
                {
                    nameList.Add(item.Substring(0,item.Length-4));
                }
                return nameList;
            }
        }


        public List<Dictionary<string, object>> GetData(DataModel model)
        {
            string query = model.Query;
            ArrayList al = new ArrayList();

            using (SqlConnection sqlConnect = new SqlConnection())
            {
                sqlConnect.ConnectionString = new ConnectionStringBuilder().CsBuilder(model);

                SqlCommand command = new SqlCommand(query, sqlConnect);
                sqlConnect.Open();

                SqlDataReader reader = command.ExecuteReader();

                var columns = new List<string>();

                for (int i = 0; i < reader.FieldCount; i++)
                {
                    columns.Add(reader.GetName(i));
                }

                var list = new List<Dictionary<string, object>>();

                while (reader.Read())
                {
                    object[] values = new object[reader.FieldCount];
                    reader.GetValues(values);
                    var item = new Dictionary<string, object>();
                    for (int i = 0; i < columns.Count; i++)
                    {
                        var columnName = columns[i];
                        var value = values[i];
                        item[columnName]= value;
                    }
                    list.Add(item);
                }
                reader.Close();
                return list;
            }
        }
    }
}
