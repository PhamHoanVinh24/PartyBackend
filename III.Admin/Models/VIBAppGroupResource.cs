using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("VIBAppGroupResource")]
    public class VIBAppGroupResource
    {
        public int ApplicationId { get; set; }
        public virtual VIBApplication Application { get; set; }

        public int GroupResourceId { get; set; }
        public virtual VIBGroupResource GroupResource { get; set; }
    }
}