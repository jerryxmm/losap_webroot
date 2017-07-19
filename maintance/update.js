/**
 * Created by jerry on 17-7-17.
 */
$(function()
{
    doUpdateBinTab();
});
function updateBin() {
	$("#updateBinForm").submit();
}
function doUpdateBinTab() {
	$('#monitorLog').hide();
	$('#mainBody').height(Math.round(document.documentElement.clientHeight*0.8));
}