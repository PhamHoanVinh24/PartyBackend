using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("AdAppGroupResource")]
    public class AdAppGroupResource
    {
        public int ApplicationId { get; set; }
        public virtual AdApplication Application { get; set; }

        public int GroupResourceId { get; set; }
        public virtual AdGroupResource GroupResource { get; set; }
    }
}