using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MobileReportService.Models
{
    public class DataModel
    {
        public List<ParameterDTO> Parameters { get; set; }

        public List<DataFieldDTO> DataSet { get; set; }
    }
}
