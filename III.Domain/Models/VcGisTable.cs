
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("VC_GIS_TABLE")]
    public class VcGisTable
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string Parent { get; set; }
        public string Type { get; set; }
        public string Node_Gis { get; set; }
        public string Created_By { get; set; }
        public DateTime Created_Time { get; set; }

    }
}
