import * as tslib_1 from "tslib";
import { LONGITUDE, X } from '../../channel';
import { channelHasField } from '../../encoding';
import { isFieldDef } from '../../fielddef';
import { QUANTITATIVE } from '../../type';
import { getMarkConfig } from '../common';
import * as mixins from './mixins';
import * as ref from './valueref';
export var text = {
    vgMark: 'text',
    encodeEntry: function (model) {
        var config = model.config, encoding = model.encoding, height = model.height, markDef = model.markDef;
        var textDef = encoding.text;
        return tslib_1.__assign({}, mixins.baseEncodeEntry(model, { size: 'ignore', orient: 'ignore' }), mixins.pointPosition('x', model, xDefault(config, textDef)), mixins.pointPosition('y', model, ref.mid(height)), mixins.text(model), mixins.nonPosition('size', model, tslib_1.__assign({}, (markDef.size ? { defaultValue: markDef.size } : {}), { vgChannel: 'fontSize' // VL's text size is fontSize
         })), mixins.valueIfDefined('align', align(model.markDef, encoding, config)));
    }
};
function xDefault(config, textDef) {
    if (isFieldDef(textDef) && textDef.type === QUANTITATIVE) {
        return { field: { group: 'width' }, offset: -5 };
    }
    // TODO: allow this to fit (Be consistent with ref.midX())
    return { value: config.scale.textXRangeStep / 2 };
}
function align(markDef, encoding, config) {
    var a = markDef.align || getMarkConfig('align', markDef, config);
    if (a === undefined) {
        return channelHasField(encoding, X) || channelHasField(encoding, LONGITUDE) ? 'center' : 'right';
    }
    // If there is a config, Vega-parser will process this already.
    return undefined;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21waWxlL21hcmsvdGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFM0MsT0FBTyxFQUFDLGVBQWUsRUFBVyxNQUFNLGdCQUFnQixDQUFDO0FBQ3pELE9BQU8sRUFBYSxVQUFVLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUV0RCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBRXhDLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFHeEMsT0FBTyxLQUFLLE1BQU0sTUFBTSxVQUFVLENBQUM7QUFDbkMsT0FBTyxLQUFLLEdBQUcsTUFBTSxZQUFZLENBQUM7QUFHbEMsTUFBTSxDQUFDLElBQU0sSUFBSSxHQUFpQjtJQUNoQyxNQUFNLEVBQUUsTUFBTTtJQUVkLFdBQVcsRUFBRSxVQUFDLEtBQWdCO1FBQ3JCLElBQUEscUJBQU0sRUFBRSx5QkFBUSxFQUFFLHFCQUFNLEVBQUUsdUJBQU8sQ0FBVTtRQUNsRCxJQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDO1FBRTlCLDRCQUNLLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFDLENBQUMsRUFDakUsTUFBTSxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFDM0QsTUFBTSxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsRUFDakQsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFDbEIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsS0FBSyx1QkFDOUIsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUNyRCxTQUFTLEVBQUUsVUFBVSxDQUFFLDZCQUE2QjtZQUNwRCxFQUNDLE1BQU0sQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUN6RTtJQUNKLENBQUM7Q0FDRixDQUFDO0FBRUYsa0JBQWtCLE1BQWMsRUFBRSxPQUEyQjtJQUMzRCxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLFlBQVksRUFBRTtRQUN4RCxPQUFPLEVBQUMsS0FBSyxFQUFFLEVBQUMsS0FBSyxFQUFFLE9BQU8sRUFBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsRUFBQyxDQUFDO0tBQzlDO0lBQ0QsMERBQTBEO0lBQzFELE9BQU8sRUFBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLEdBQUcsQ0FBQyxFQUFDLENBQUM7QUFDbEQsQ0FBQztBQUVELGVBQWUsT0FBZ0IsRUFBRSxRQUEwQixFQUFFLE1BQWM7SUFDekUsSUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLEtBQUssSUFBSSxhQUFhLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNuRSxJQUFJLENBQUMsS0FBSyxTQUFTLEVBQUU7UUFDbkIsT0FBTyxlQUFlLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxJQUFJLGVBQWUsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO0tBQ2xHO0lBQ0QsK0RBQStEO0lBQy9ELE9BQU8sU0FBUyxDQUFDO0FBQ25CLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0xPTkdJVFVERSwgWH0gZnJvbSAnLi4vLi4vY2hhbm5lbCc7XG5pbXBvcnQge0NvbmZpZ30gZnJvbSAnLi4vLi4vY29uZmlnJztcbmltcG9ydCB7Y2hhbm5lbEhhc0ZpZWxkLCBFbmNvZGluZ30gZnJvbSAnLi4vLi4vZW5jb2RpbmcnO1xuaW1wb3J0IHtDaGFubmVsRGVmLCBpc0ZpZWxkRGVmfSBmcm9tICcuLi8uLi9maWVsZGRlZic7XG5pbXBvcnQge01hcmtEZWZ9IGZyb20gJy4uLy4uL21hcmsnO1xuaW1wb3J0IHtRVUFOVElUQVRJVkV9IGZyb20gJy4uLy4uL3R5cGUnO1xuaW1wb3J0IHtWZ1ZhbHVlUmVmfSBmcm9tICcuLi8uLi92ZWdhLnNjaGVtYSc7XG5pbXBvcnQge2dldE1hcmtDb25maWd9IGZyb20gJy4uL2NvbW1vbic7XG5pbXBvcnQge1VuaXRNb2RlbH0gZnJvbSAnLi4vdW5pdCc7XG5pbXBvcnQge01hcmtDb21waWxlcn0gZnJvbSAnLi9iYXNlJztcbmltcG9ydCAqIGFzIG1peGlucyBmcm9tICcuL21peGlucyc7XG5pbXBvcnQgKiBhcyByZWYgZnJvbSAnLi92YWx1ZXJlZic7XG5cblxuZXhwb3J0IGNvbnN0IHRleHQ6IE1hcmtDb21waWxlciA9IHtcbiAgdmdNYXJrOiAndGV4dCcsXG5cbiAgZW5jb2RlRW50cnk6IChtb2RlbDogVW5pdE1vZGVsKSA9PiB7XG4gICAgY29uc3Qge2NvbmZpZywgZW5jb2RpbmcsIGhlaWdodCwgbWFya0RlZn0gPSBtb2RlbDtcbiAgICBjb25zdCB0ZXh0RGVmID0gZW5jb2RpbmcudGV4dDtcblxuICAgIHJldHVybiB7XG4gICAgICAuLi5taXhpbnMuYmFzZUVuY29kZUVudHJ5KG1vZGVsLCB7c2l6ZTogJ2lnbm9yZScsIG9yaWVudDogJ2lnbm9yZSd9KSxcbiAgICAgIC4uLm1peGlucy5wb2ludFBvc2l0aW9uKCd4JywgbW9kZWwsIHhEZWZhdWx0KGNvbmZpZywgdGV4dERlZikpLFxuICAgICAgLi4ubWl4aW5zLnBvaW50UG9zaXRpb24oJ3knLCBtb2RlbCwgcmVmLm1pZChoZWlnaHQpKSxcbiAgICAgIC4uLm1peGlucy50ZXh0KG1vZGVsKSxcbiAgICAgIC4uLm1peGlucy5ub25Qb3NpdGlvbignc2l6ZScsIG1vZGVsLCB7XG4gICAgICAgIC4uLihtYXJrRGVmLnNpemUgPyB7ZGVmYXVsdFZhbHVlOiBtYXJrRGVmLnNpemV9IDoge30pLFxuICAgICAgICB2Z0NoYW5uZWw6ICdmb250U2l6ZScgIC8vIFZMJ3MgdGV4dCBzaXplIGlzIGZvbnRTaXplXG4gICAgICB9KSxcbiAgICAgIC4uLm1peGlucy52YWx1ZUlmRGVmaW5lZCgnYWxpZ24nLCBhbGlnbihtb2RlbC5tYXJrRGVmLCBlbmNvZGluZywgY29uZmlnKSlcbiAgICB9O1xuICB9XG59O1xuXG5mdW5jdGlvbiB4RGVmYXVsdChjb25maWc6IENvbmZpZywgdGV4dERlZjogQ2hhbm5lbERlZjxzdHJpbmc+KTogVmdWYWx1ZVJlZiB7XG4gIGlmIChpc0ZpZWxkRGVmKHRleHREZWYpICYmIHRleHREZWYudHlwZSA9PT0gUVVBTlRJVEFUSVZFKSB7XG4gICAgcmV0dXJuIHtmaWVsZDoge2dyb3VwOiAnd2lkdGgnfSwgb2Zmc2V0OiAtNX07XG4gIH1cbiAgLy8gVE9ETzogYWxsb3cgdGhpcyB0byBmaXQgKEJlIGNvbnNpc3RlbnQgd2l0aCByZWYubWlkWCgpKVxuICByZXR1cm4ge3ZhbHVlOiBjb25maWcuc2NhbGUudGV4dFhSYW5nZVN0ZXAgLyAyfTtcbn1cblxuZnVuY3Rpb24gYWxpZ24obWFya0RlZjogTWFya0RlZiwgZW5jb2Rpbmc6IEVuY29kaW5nPHN0cmluZz4sIGNvbmZpZzogQ29uZmlnKSB7XG4gIGNvbnN0IGEgPSBtYXJrRGVmLmFsaWduIHx8IGdldE1hcmtDb25maWcoJ2FsaWduJywgbWFya0RlZiwgY29uZmlnKTtcbiAgaWYgKGEgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBjaGFubmVsSGFzRmllbGQoZW5jb2RpbmcsIFgpIHx8IGNoYW5uZWxIYXNGaWVsZChlbmNvZGluZywgTE9OR0lUVURFKSA/ICdjZW50ZXInIDogJ3JpZ2h0JztcbiAgfVxuICAvLyBJZiB0aGVyZSBpcyBhIGNvbmZpZywgVmVnYS1wYXJzZXIgd2lsbCBwcm9jZXNzIHRoaXMgYWxyZWFkeS5cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cbiJdfQ==